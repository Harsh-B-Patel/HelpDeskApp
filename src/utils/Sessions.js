class Session{

    constructor(username, uuid, admin, expiresAt){
        this.username = username;
        this.uuid = uuid;
        this.admin = admin;
        this.expiresAt = expiresAt;
    }

    isExpired() {
        this.expiresAt < (new Date());
    }
}

module.exports = Session;