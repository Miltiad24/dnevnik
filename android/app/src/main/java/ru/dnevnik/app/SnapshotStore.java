package ru.dnevnik.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.Charset;

public final class SnapshotStore {
    private static final String PREF = "dnevnik";
    private static final String KEY_SNAPSHOT = "snapshot";
    private static final String KEY_PLANNER = "planner";
    private static final Charset UTF8 = Charset.forName("UTF-8");

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
        if (!shouldWrite(ctx, json)) return;
        prefs(ctx).edit().putString(KEY_PLANNER, json).commit();
        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(plannerFile(ctx));
            fos.write(json.getBytes(UTF8));
            fos.flush();
            fos.getFD().sync();
        } catch (Exception ignored) {
        } finally {
            if (fos != null) {
                try {
                    fos.close();
                } catch (Exception ignored) {
                }
            }
        }
    }

    public static String planner(Context ctx) {
        String fromFile = readFile(plannerFile(ctx));
        if (looksLikePlanner(fromFile)) return fromFile;
        String fromPrefs = prefs(ctx).getString(KEY_PLANNER, "");
        return fromPrefs == null ? "" : fromPrefs;
    }

    static boolean looksLikePlanner(String json) {
        return json != null && json.contains("\"state\"") && json.contains("subjects");
    }

    private static boolean shouldWrite(Context ctx, String json) {
        if (!looksLikePlanner(json)) return false;
        boolean incomingEmpty = json.contains("\"seeded\":false") && json.contains("\"subjects\":[]");
        if (!incomingEmpty) return true;
        return !looksLikePlanner(planner(ctx));
    }

    private static File plannerFile(Context ctx) {
        return new File(ctx.getFilesDir(), "planner.json");
    }

    private static String readFile(File file) {
        if (file == null || !file.exists() || file.length() < 8) return "";
        FileInputStream in = null;
        try {
            byte[] data = new byte[(int) file.length()];
            in = new FileInputStream(file);
            int read = in.read(data);
            if (read <= 0) return "";
            return new String(data, 0, read, UTF8);
        } catch (Exception e) {
            return "";
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (Exception ignored) {
                }
            }
        }
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
    }
}