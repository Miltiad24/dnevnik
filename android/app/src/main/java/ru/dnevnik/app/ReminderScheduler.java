package ru.dnevnik.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

public final class ReminderScheduler {
    private static final String PREF = "dnevnik";
    private static final String COUNT = "alarmCount";

    private ReminderScheduler() {}

    public static void schedule(Context ctx, String json) {
        AlarmManager alarms = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (alarms == null) return;

        SharedPreferences prefs = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        int previous = prefs.getInt(COUNT, 0);
        for (int i = 0; i < previous; i++) {
            alarms.cancel(alarmIntent(ctx, i, "", ""));
        }

        JSONArray list;
        try {
            list = new JSONObject(json).optJSONArray("reminders");
        } catch (Exception e) {
            list = null;
        }
        if (list == null) {
            prefs.edit().putInt(COUNT, 0).apply();
            return;
        }

        long now = System.currentTimeMillis();
        int scheduled = 0;
        for (int i = 0; i < list.length(); i++) {
            JSONObject item = list.optJSONObject(i);
            if (item == null) continue;
            long at = item.optLong("at", 0);
            if (at <= now + 2000) continue;
            String title = item.optString("title", "Дневник");
            String body = item.optString("body", "");
            PendingIntent pi = alarmIntent(ctx, scheduled, title, body);
            setAlarm(alarms, at, pi);
            scheduled++;
        }
        prefs.edit().putInt(COUNT, scheduled).apply();
    }

    public static void rescheduleFromStore(Context ctx) {
        schedule(ctx, SnapshotStore.raw(ctx));
    }

    private static void setAlarm(AlarmManager alarms, long at, PendingIntent pi) {
        try {
            if (Build.VERSION.SDK_INT >= 31 && !alarms.canScheduleExactAlarms()) {
                alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            } else if (Build.VERSION.SDK_INT >= 23) {
                alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            } else {
                alarms.set(AlarmManager.RTC_WAKEUP, at, pi);
            }
        } catch (SecurityException e) {
            alarms.set(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    private static PendingIntent alarmIntent(Context ctx, int index, String title, String body) {
        Intent intent = new Intent(ctx, ReminderReceiver.class);
        intent.setAction("ru.dnevnik.app.REMIND");
        intent.putExtra("title", title);
        intent.putExtra("body", body);
        intent.putExtra("nid", 200 + index);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(ctx, 100 + index, intent, flags);
    }
}
