class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode || 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

// 1️ Authentication & Authorization Errors
class AuthError extends AppError {
    constructor(message = "Not authorized") {
        super(message, 401);
    }
}

class InvalidTokenError extends AppError {
    constructor(message = "Invalid or expired token") {
        super(message, 403);
    }
}

class ForbiddenActionError extends AppError {
    constructor(message = "You do not have permission to perform this action") {
        super(message, 403);
    }
}

class PermissionDeniedError extends AppError {
    constructor(message = "Access denied") {
        super(message, 403);
    }
}

// 2️ Database Errors
class DatabaseConnectionError extends AppError {
    constructor(message = "Failed to connect to the database") {
        super(message, 500);
    }
}

class DatabaseQueryError extends AppError {
    constructor(message = "Database query failed") {
        super(message, 500);
    }
}

// 3️ Validation Errors
class ValidationError extends AppError {
    constructor(message = "Validation failed") {
        super(message, 400);
    }
}

class MissingFieldError extends AppError {
    constructor(field) {
        super(`Missing required field: ${field}`, 400);
    }
}

class DuplicateEntryError extends AppError {
    constructor(message = "Duplicate entry detected") {
        super(message, 409);
    }
}

class InvalidDateError extends AppError {
    constructor(message = "Invalid date format") {
        super(message, 400);
    }
}

// 4️ User (Student/Employee) Errors
class InvalidUserIDError extends AppError {
    constructor(message = "Invalid User ID format") {
        super(message, 400);
    }
}

class InvalidRoleError extends AppError {
    constructor(message = "Invalid Role Code") {
        super(message, 400);
    }
}

class StudentNotFoundError extends AppError {
    constructor(message = "Student not found") {
        super(message, 404);
    }
}

class EmployeeNotFoundError extends AppError {
    constructor(message = "Employee not found") {
        super(message, 404);
    }
}

// 5️⃣ Course & Attendance Errors
class CourseNotFoundError extends AppError {
    constructor(message = "Course not found") {
        super(message, 404);
    }
}

class ScheduleConflictError extends AppError {
    constructor(message = "Schedule conflict detected") {
        super(message, 409);
    }
}

class AttendanceRecordNotFoundError extends AppError {
    constructor(message = "Attendance record not found") {
        super(message, 404);
    }
}

// 6️⃣ Payment & Fee Errors
class PaymentFailedError extends AppError {
    constructor(message = "Payment transaction failed") {
        super(message, 400);
    }
}

class InsufficientBalanceError extends AppError {
    constructor(message = "Insufficient balance in account") {
        super(message, 402);
    }
}

class InvoiceNotFoundError extends AppError {
    constructor(message = "Invoice not found") {
        super(message, 404);
    }
}

// 7️⃣ Internal Server Errors
class InternalServerError extends AppError {
    constructor(message = "Internal server error") {
        super(message, 500);
    }
}

export {
    AppError,
    AuthError,
    InvalidTokenError,
    ForbiddenActionError,
    PermissionDeniedError,
    DatabaseConnectionError,
    DatabaseQueryError,
    ValidationError,
    MissingFieldError,
    DuplicateEntryError,
    InvalidDateError,
    InvalidUserIDError,
    InvalidRoleError,
    StudentNotFoundError,
    EmployeeNotFoundError,
    CourseNotFoundError,
    ScheduleConflictError,
    AttendanceRecordNotFoundError,
    PaymentFailedError,
    InsufficientBalanceError,
    InvoiceNotFoundError,
    InternalServerError
};
