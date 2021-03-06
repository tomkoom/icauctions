import Array "mo:base/Array";
import Float "mo:base/Float";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Types "./types";

shared(msg) actor class Governor(starterApp: Principal, voteThreshold: Float) {
    let owner = msg.caller;

    type Proposal = Types.Proposal;
    type ProposalStatus = Types.ProposalStatus;
    type Vote = Types.Vote;
    type Result = Result.Result<(), Types.GovError>;
    type PropResult = Result.Result<ProposalStatus, Types.GovError>;

    var currentApp = starterApp;
    var proposals: [var Proposal] = [var];

    public query func getCurrentApp() : async (Principal) {
        currentApp
    };

    // swaps in the new App canister to replace the previous version
    public shared(msg) func migrate(propNum: Nat) : async (Result) {
        switch (_checkProposal(propNum)) {
            case (#ok(status)) {
                switch (status) {
                    case (#succeeded) {
                        currentApp := proposals[propNum].newApp;
                        #ok()
                    };
                    case (_) #err(#proposalNotActive);
                }
            };
            case (#err(e)) #err(e);
        };
    };

    // create a new proposal foraApp migration
    public shared(msg) func propose(newApp: Principal) : async (Nat) {
        proposals := Array.thaw<Proposal>(
        Array.append<Proposal>(Array.freeze<Proposal>(proposals), [makeProposal(newApp, msg.caller)]));
        proposals.size();
    };

    // Cancel a proposal
    public shared(msg) func cancelProposal(propNum: Nat) : async (Result) {
        if (proposals.size() < propNum) return #err(#proposalNotFound);
        let prop = proposals[propNum];
        if (msg.caller != owner and msg.caller != prop.proposer) return #err(#incorrectPermissions);
        switch (prop.status) {
            case (#active) {
                prop.status := #canceled;
                proposals[propNum] := prop;
                #ok()
            };
            case (_) #err(#proposalNotActive);
        }
    };

    // record a new proposal vote
    public func voteOnProposal(propNum: Nat, vote: Vote) : async (Result) {
        switch (_checkProposal(propNum)) {
            case (#ok(status)) {
                switch (status) {
                    case (#active) {
                        let prop = proposals[propNum];
                        switch (vote) {
                            case (#inFavor) prop.votesFor += 1;
                            case (#against) prop.votesAgainst += 1;
                        };
                        proposals[propNum] := prop;
                        #ok()
                    };
                    case (_) #err(#proposalNotActive);
                }
            };
            case (#err(e)) #err(e);
        }
    };

    // external-facing method for inter-canister calls
    public func checkProposal(propNum: Nat) : async (PropResult) {
        _checkProposal(propNum)
    };

    // checks if the given proposal has exceeded its time to live
    func _checkProposal(propNum: Nat) : (PropResult) {
        if (proposals.size() < propNum) return #err(#proposalNotFound);
        let prop = proposals[propNum];
        let status = switch (prop.status) {
            case (#active) {
                if (Time.now() > prop.ttl) {
                    let outcome = Float.div(Float.fromInt(prop.votesFor), (Float.fromInt(prop.votesFor) + Float.fromInt(prop.votesAgainst)));
                    if (outcome > voteThreshold) {
                        prop.status := #succeeded;
                        proposals[propNum] := prop;
                        #succeeded
                    } else {
                        prop.status := #defeated;
                        proposals[propNum] := prop;
                        #defeated
                    }
                } else {
                    #active
                }
            };
            case (anythingElse) anythingElse;
        };
        #ok(status)
    };

    // create a new proposal
    func makeProposal(_newApp: Principal, _proposer: Principal) : (Proposal) {
        {
            newApp = _newApp;
            proposer = _proposer;
            var votesFor = 0;
            var votesAgainst = 0;
            var status: ProposalStatus = #active;
            ttl = Time.now() + (3600 * 1000_000_000);
        }
    };

};