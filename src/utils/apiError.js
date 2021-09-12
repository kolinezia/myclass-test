class ApiError extends Error {
    constructor(name, statusCode, message) {
        super(message);
        this.name = name;
        this.status = statusCode;
    }
}

module.exports = ApiError;
