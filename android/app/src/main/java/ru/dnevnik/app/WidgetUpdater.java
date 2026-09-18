package ru.dnevnik.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;

public final class WidgetUpdater {
    private WidgetUpdater() {}

    public static void updateAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] todayIds = mgr.getAppWidgetIds(new ComponentName(ctx, TodayWidgetProvider.class));
        if (todayIds.length > 0) {
            new TodayWidgetProvider().onUpdate(ctx, mgr, todayIds);
        }
        int[] listIds = mgr.getAppWidgetIds(new ComponentName(ctx, ListWidgetProvider.class));
        if (listIds.length > 0) {
            new ListWidgetProvider().onUpdate(ctx, mgr, listIds);
        }
    }
}
