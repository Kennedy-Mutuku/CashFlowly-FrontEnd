import { useEffect, useState } from 'react';
import { registerPlugin } from '@capacitor/core';
import { parseMpesaMessage } from '../utils/mpesaParser';

const MpesaListener = registerPlugin('MpesaListener');

export const useMpesaListener = (onParsed) => {
    useEffect(() => {
        let listener;

        const setupListener = async () => {
            try {
                // Request permissions if needed (handled by Capacitor automatically in some cases, but good to check)
                // Note: READ_SMS is a sensitive permission, user must grant it in Android settings

                listener = await MpesaListener.addListener('mpesaReceived', (data) => {
                    console.log('M-PESA Message Received through Bridge:', data.message);
                    const parsed = parseMpesaMessage(data.message);
                    if (parsed && onParsed) {
                        onParsed(parsed);
                    }
                });
            } catch (err) {
                console.error('Failed to setup native MpesaListener:', err);
            }
        };

        setupListener();

        return () => {
            if (listener) {
                listener.remove();
            }
        };
    }, [onParsed]);
};
