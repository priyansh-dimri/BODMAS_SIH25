import * as LocalAuthentication from "expo-local-authentication";

export const AuthStatus = {
  SUCCESS: "SUCCESS",
  NO_HARDWARE: "NO_HARDWARE",
  NOT_ENROLLED: "NOT_ENROLLED",
  FAILED: "FAILED",
  ERROR: "ERROR",
};

export const promptLocalAuthentication = async (reason) => {
  try {
    // 1. Check for hardware.
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      const message =
        "Biometric authentication is not available on this device.";
      console.warn(message);
      return { status: AuthStatus.NO_HARDWARE, message };
    }

    // 2. Check for enrollment.
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      const message =
        "User has not set up biometrics or a PIN on their device.";
      console.warn(message);
      return { status: AuthStatus.NOT_ENROLLED, message };
    }

    // 3. Trigger the prompt.
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason || "Please authenticate to continue",
      disableDeviceFallback: false, // Allows fallback to device PIN/password
    });

    if (result.success) {
      return { status: AuthStatus.SUCCESS };
    } else {
      // This case handles user cancellation or too many failed attempts.
      const message =
        result.error || "Authentication failed or was cancelled by the user.";
      return { status: AuthStatus.FAILED, message };
    }
  } catch (error) {
    console.error("An error occurred during local authentication:", error);
    return { status: AuthStatus.ERROR, message: error.message };
  }
};
