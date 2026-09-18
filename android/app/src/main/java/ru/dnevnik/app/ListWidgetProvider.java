package ru.dnevnik.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.graphics.Color;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class ListWidgetProvider extends AppWidgetProvider {
    private static final int[] ROWS = {R.id.row1, R.id.row2, R.id.row3};
    private static final int[] BARS = {R.id.bar1, R.id.bar2, R.id.bar3};
    private static final int[] TITLES = {R.id.title1, R.id.title2, R.id.title3};
    private static final int[] METAS = {R.id.meta1, R.id.meta2, R.id.meta3};

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        JSONObject snap = SnapshotStore.read(context);
        String headline = snap.optString("headline", "Дневник");
        JSONArray items = snap.optJSONArray("items");
        int count = items == null ? 0 : Math.min(3, items.length());

        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_list);
            views.setTextViewText(R.id.header, "Дневник · " + headline);
            views.setViewVisibility(R.id.empty, count == 0 ? View.VISIBLE : View.GONE);

            for (int i = 0; i < 3; i++) {
                if (i < count) {
                    JSONObject item = items.optJSONObject(i);
                    String title = item != null ? item.optString("title") : "";
                    String meta = item != null ? item.optString("meta") : "";
                    String color = item != null ? item.optString("color", "#2A5F52") : "#2A5F52";
                    boolean urgent = item != null && item.optBoolean("urgent", false);
                    views.setViewVisibility(ROWS[i], View.VISIBLE);
                    views.setTextViewText(TITLES[i], title);
                    views.setTextViewText(METAS[i], meta);
                    views.setTextColor(TITLES[i], Color.parseColor(urgent ? "#9E3A2C" : "#1C1814"));
                    try {
                        views.setInt(BARS[i], "setBackgroundColor", Color.parseColor(color));
                    } catch (Exception ignored) {
                    }
                } else {
                    views.setViewVisibility(ROWS[i], View.GONE);
                }
            }

            views.setOnClickPendingIntent(R.id.root, Intents.openApp(context, 22));
            manager.updateAppWidget(id, views);
        }
    }
}
