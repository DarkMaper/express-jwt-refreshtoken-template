const error_types = {
    UNAUTHORIZED(msg) {
        let err = Error.apply(this, [msg]);
        this.name = err.name = "UNAUTHORIZED";
        this.message = err.message;
        this.stack = err.stack;
        return this;
    },
    FORBIDDEN(msg) {
        let err = Error.apply(this, [msg]);
        this.name = err.name = "FORBBIDEN";
        this.message = err.message;
        this.stack = err.stack;
        return this;
    },
    INTERNAL_ERROR(msg) {
        let err = Error.apply(this, [msg]);
        this.name = err.name = "INTERNAL_ERROR";
        this.message = err.message;
        this.stack = err.stack;
        return this;
    },
    NOT_FOUND(msg) {
        let err = Error.apply(this, [msg]);
        this.name = err.name = "NOT_FOUND";
        this.message = err.message;
        this.stack = err.stack;
        return this;
    },
    CONFLICT(msg) {
        let err = Error.apply(this, [msg]);
        this.name = err.name = "CONFLICT";
        this.message = err.message;
        this.stack = err.stack;
        return this;
    },
    InfoError(msg) {
        let err = Error.apply(this, [msg]);
        this.name = err.name = "InfoError";
        this.message = err.message;
        this.stack = err.stack;
        return this;
    }
}

export default error_types;