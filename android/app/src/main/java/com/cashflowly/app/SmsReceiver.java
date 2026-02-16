package com.cashflowly.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;
import com.getcapacitor.JSObject;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiver";
    private static SmsListener listener;

    public static void setListener(SmsListener l) {
        listener = l;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals("android.provider.Telephony.SMS_RECEIVED")) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                        String sender = smsMessage.getDisplayOriginatingAddress();
                        String messageBody = smsMessage.getMessageBody();

                        Log.d(TAG, "SMS Received from: " + sender);

                        // Only process M-PESA messages
                        if (sender.equalsIgnoreCase("MPESA")) {
                            if (listener != null) {
                                listener.onTextReceived(messageBody);
                            }
                        }
                    }
                }
            }
        }
    }

    public interface SmsListener {
        void onTextReceived(String text);
    }
}
