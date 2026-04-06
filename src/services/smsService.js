import { registerPlugin } from '@capacitor/core';
import { parseMpesaMessage } from '../utils/mpesaParser';

// Register the custom MpesaListener native plugin
const MpesaListener = registerPlugin('MpesaListener');

/**
 * SMSService handles native SMS detection for M-Pesa.
 * It uses the existing custom MpesaListener native plugin to detect messages
 * from the "MPESA" sender and provides a clean callback for the UI.
 */
class SMSService {
    constructor() {
        this.listener = null;
    }

    /**
     * Initializes the SMS listener and requests necessary permissions.
     * @param {Function} onMessageDetected - Callback when a new M-Pesa message is detected.
     */
    async initialize(onMessageDetected) {
        try {
            // Check if we are running in a native environment (Android/iOS)
            const isNative = window.Capacitor?.isNativePlatform();
            if (!isNative) {
                console.log('SMS Automation: Native environment not detected. Running in web mode.');
                return;
            }

            // Check if permissions are already granted
            const status = await MpesaListener.checkPermissions();
            if (!status.granted) {
                console.log('SMS Automation: SMS permissions not granted. This feature requires READ_SMS permission.');
                // Note: The app should ideally show a professional prompt explaining why 
                // this permission is needed before the system dialog appears.
            }

            // Add the listener for the 'mpesaReceived' event from the native plugin
            this.listener = await MpesaListener.addListener('mpesaReceived', (data) => {
                const messageBody = data.message;
                const parsed = parseMpesaMessage(messageBody);
                if (parsed) {
                    onMessageDetected(parsed);
                }
            });

            console.log('SMS Automation: Intelligent M-Pesa listener initialized.');
        } catch (error) {
            console.error('SMS Automation: Initialization failed', error);
        }
    }

    /**
     * Stops the SMS listener to free up resources.
     */
    async stop() {
        if (this.listener) {
            await this.listener.remove();
            this.listener = null;
        }
    }
}

export default new SMSService();
