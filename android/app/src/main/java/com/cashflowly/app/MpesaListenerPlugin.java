package com.cashflowly.app;

import android.Manifest;
import android.content.Context;
import android.content.IntentFilter;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.PermissionState;

@CapacitorPlugin(
    name = "MpesaListener",
    permissions = {
        @Permission(strings = { Manifest.permission.READ_SMS }, alias = "readSms"),
        @Permission(strings = { Manifest.permission.RECEIVE_SMS }, alias = "receiveSms"),
    }
)
public class MpesaListenerPlugin extends Plugin {

    private SmsReceiver smsReceiver;
    private boolean receiverRegistered = false;

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
    }

    private void registerSmsReceiver() {
        if (receiverRegistered) return;
        IntentFilter filter = new IntentFilter("android.provider.Telephony.SMS_RECEIVED");
        filter.setPriority(999);
        if (Build.VERSION.SDK_INT >= 34) {
            getContext().registerReceiver(smsReceiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            getContext().registerReceiver(smsReceiver, filter);
        }
        receiverRegistered = true;
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        boolean readGranted = getPermissionState("readSms") == PermissionState.GRANTED;
        boolean receiveGranted = getPermissionState("receiveSms") == PermissionState.GRANTED;
        ret.put("granted", readGranted && receiveGranted);
        if (readGranted && receiveGranted) {
            registerSmsReceiver();
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        requestAllPermissions(call, "permissionsCallback");
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        JSObject ret = new JSObject();
        boolean granted = getPermissionState("readSms") == PermissionState.GRANTED
                       && getPermissionState("receiveSms") == PermissionState.GRANTED;
        ret.put("granted", granted);
        if (granted) {
            registerSmsReceiver();
        }
        call.resolve(ret);
    }
}
