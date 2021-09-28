import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Types "./types";

shared(msg) actor class Balances() {
    let owner = msg.caller;
    type UserId = Types.UserId;
    type Result = Types.Result;

    let userIdToBalance = HashMap.HashMap<UserId, Nat>(1, Principal.equal, Principal.hash);

    // retrieve user's balance
    public query func getBalance(user: UserId) : async (Nat) {
        _getBalance(user)
    };
    
    // transfer money between users
    public shared(msg) func transfer(from: UserId, to: UserId, _amount: Nat) : async (Result) {
        let fromBalance = _getBalance(from);
        if (_amount < fromBalance) {
            #err(#insufficientBalance)
        } else {
            let toBalance = _getBalance(to);
            userIdToBalance.put(from, fromBalance - _amount);
            userIdToBalance.put(to, toBalance + _amount);
            #ok()
        }
    };

    // deposit funds into a user account
    public shared(msg) func deposit(user: UserId, amount: Nat) : async () {
        assert (owner == msg.caller);
        userIdToBalance.put(user, (_getBalance(user)) + amount);
    };

    // retrieve user's balance
    func _getBalance(user: UserId) : (Nat) {
        switch (userIdToBalance.get(user)) {
            case (null) 0;
            case (?balance) balance;
        }
    };
};