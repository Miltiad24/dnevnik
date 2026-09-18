package ru.dnevnik.app;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

public final class Intents {
    private Intents() {}

    public static PendingIntent openApp(Context ctx, int requestCode) {
        Intent intent = new Intent(ctx, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getActivity(ctx, requestCode, intent, flags);
    }
}
