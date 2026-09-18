package ru.dnevnik.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        int nid = intent.getIntExtra("nid", 200);
        if (title == null || title.isEmpty()) title = "Дневник";
        if (body == null) body = "";

        NotificationManager manager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= 26) {
            if (manager != null && manager.getNotificationChannel(MainActivity.CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(
                        MainActivity.CHANNEL_ID,
                        context.getString(R.string.channel_name),
                        NotificationManager.IMPORTANCE_HIGH
                );
                manager.createNotificationChannel(channel);
            }
            builder = new Notification.Builder(context, MainActivity.CHANNEL_ID);
        } else {
            builder = new Notification.Builder(context);
        }

        builder.setSmallIcon(R.drawable.ic_stat_book)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(Intents.openApp(context, 30 + nid));

        if (Build.VERSION.SDK_INT < 26) {
            builder.setPriority(Notification.PRIORITY_HIGH);
        }

        if (manager != null) {
            manager.notify(nid, builder.build());
        }
    }
}
