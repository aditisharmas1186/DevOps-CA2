class ApiResponse {
    constructor(statusCode = 200, data, message = 'Success') {
        this.statusCode = statusCode < 400;
        this.data = data;
        this.message = message;
    }
}

export { ApiResponse };