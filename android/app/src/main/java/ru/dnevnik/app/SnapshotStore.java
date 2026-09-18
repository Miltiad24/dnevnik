package ru.dnevnik.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

public final class SnapshotStore {
    private static final String PREF = "dnevnik";
    private static final String KEY_SNAPSHOT = "snapshot";
    private static final String KEY_PLANNER = "planner";

    private SnapshotStore() {}

    public static void save(Context ctx, String json) {
        prefs(ctx).edit().putString(KEY_SNAPSHOT, json).apply();
    }

    public static String raw(Context ctx) {
        return prefs(ctx).getString(KEY_SNAPSHOT, "{}");
    }

    public static JSONObject read(Context ctx) {
        try {
            return new JSONObject(raw(ctx));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    public static void savePlanner(Context ctx, String json) {
        prefs(ctx).edit().putString(KEY_PLANNER, json == null ? "" : json).commit();
    }

    public static String planner(Context ctx) {
        return prefs(ctx).getString(KEY_PLANNER, "");
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
    }
}