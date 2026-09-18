package ru.dnevnik.app;

import android.webkit.JavascriptInterface;

public class DnevnikBridge {
    private final MainActivity activity;

    DnevnikBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public void sync(String json) {
        SnapshotStore.save(activity, json);
        WidgetUpdater.updateAll(activity);
        ReminderScheduler.schedule(activity, json);
    }

    @JavascriptInterface
    public String getPlanner() {
        String value = SnapshotStore.planner(activity);
        return value == null ? "" : value;
    }

    @JavascriptInterface
    public void setPlanner(String json) {
        SnapshotStore.savePlanner(activity, json);
    }

    @JavascriptInterface
    public void requestNotifications() {
        activity.runOnUiThread(activity::askNotificationPermission);
    }
}