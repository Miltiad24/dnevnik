package ru.dnevnik.app;

import android.content.Context;
import android.webkit.JsPromptResult;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

public class DnevnikChromeClient extends WebChromeClient {
    static final String SAVE = "__DNEVNIK_SAVE__";
    static final String LOAD = "__DNEVNIK_LOAD__";

    private final Context context;

    DnevnikChromeClient(Context context) {
        this.context = context.getApplicationContext();
    }

    @Override
    public boolean onJsPrompt(
            WebView view,
            String url,
            String message,
            String defaultValue,
            JsPromptResult result
    ) {
        if (SAVE.equals(message)) {
            SnapshotStore.savePlanner(context, defaultValue);
            result.confirm("ok");
            return true;
        }
        if (LOAD.equals(message)) {
            result.confirm(SnapshotStore.planner(context));
            return true;
        }
        return false;
    }
}