package com.cashflowly.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MpesaListener")
public class MpesaListenerPlugin extends Plugin {

    @Override
    public void load() {
        SmsReceiver.setListener(new SmsReceiver.SmsListener() {
            @Override
            public void onTextReceived(String text) {
                JSObject ret = new JSObject();
                ret.put("message", text);
                notifyListeners("mpesaReceived", ret);
            }
        });
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        // Handy method to check if the app has SMS permissions
        JSObject ret = new JSObject();
        ret.put("granted", getContext().checkSelfPermission(android.Manifest.permission.READ_SMS) == android.content.pm.PackageManager.PERMISSION_GRANTED);
        call.resolve(ret);
    }
}
