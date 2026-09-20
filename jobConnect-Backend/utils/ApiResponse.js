/**
 * Standardized API Response class for production applications
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;

    // For backward compatibility: if data is an object (not null and not an array),
    // copy its keys to the root response object so legacy frontend consumers continue working seamlessly.
    if (data && typeof data === "object") {
      if (!Array.isArray(data)) {
        Object.assign(this, data);
      }
    }
  }
}

export { ApiResponse };
export default ApiResponse;
