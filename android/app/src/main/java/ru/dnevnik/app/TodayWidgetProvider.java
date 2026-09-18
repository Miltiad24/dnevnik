package ru.dnevnik.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.graphics.Color;
import android.widget.RemoteViews;

import org.json.JSONObject;

public class TodayWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        JSONObject snap = SnapshotStore.read(context);
        int left = snap.optInt("todayLeft", 0);
        int overdue = snap.optInt("overdue", 0);
        String subhead = snap.optString("subhead", "ещё сегодня");

        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_today);
            views.setTextViewText(R.id.count, String.valueOf(left));
            views.setTextViewText(R.id.subhead, subhead);
            views.setTextColor(R.id.subhead, overdue > 0
                    ? Color.parseColor("#9E3A2C")
                    : Color.parseColor("#6F675E"));
            views.setOnClickPendingIntent(R.id.root, Intents.openApp(context, 21));
            manager.updateAppWidget(id, views);
        }
    }
}
