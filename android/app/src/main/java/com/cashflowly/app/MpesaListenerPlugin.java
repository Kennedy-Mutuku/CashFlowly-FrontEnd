package com.cashflowly.app;

import android.content.Context;
import android.content.IntentFilter;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MpesaListener")
public class MpesaListenerPlugin extends Plugin {

    private SmsReceiver smsReceiver;

    @Override
    public void load() {
        smsReceiver = new SmsReceiver();
        SmsReceiver.setListener(new SmsReceiver.SmsListener() {
            @Override
            public void onTextReceived(String text) {
                JSObject ret = new JSObject();
                ret.put("message", text);
                notifyListeners("mpesaReceived", ret);
            }
        });

        // Professional Dynamic Registration for Android 14+
        IntentFilter filter = new IntentFilter("android.provider.Telephony.SMS_RECEIVED");
        if (Build.VERSION.SDK_INT >= 34) {
            getContext().registerReceiver(smsReceiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            getContext().registerReceiver(smsReceiver, filter);
        }
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        // Handy method to check if the app has SMS permissions
        JSObject ret = new JSObject();
        ret.put("granted", getContext().checkSelfPermission(android.Manifest.permission.READ_SMS) == android.content.pm.PackageManager.PERMISSION_GRANTED);
        call.resolve(ret);
    }
}
