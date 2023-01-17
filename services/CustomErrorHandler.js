class CustomErrorHandler extends Error{
    constructor(status, msg){
        super();
        this.status = status;
        this.message = msg;
    }

    static alreadyExist(message) {
        let status = 409;
        return new CustomErrorHandler(status,message);
    }

    static wrongCredentials(message = 'Username or password is wrong!') {
        let status = 401;
        return new CustomErrorHandler(status,message);
    }
}

export default CustomErrorHandler;