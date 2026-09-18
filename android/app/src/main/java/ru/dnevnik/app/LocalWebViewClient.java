package ru.dnevnik.app;

import android.content.Context;
import android.content.res.AssetManager;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;

public class LocalWebViewClient extends WebViewClient {
    static final String HOST = "dnevnik.local";
    private static final Charset UTF8 = Charset.forName("UTF-8");

    private final Context context;
    private final AssetManager assets;

    LocalWebViewClient(Context context) {
        this.context = context.getApplicationContext();
        this.assets = context.getAssets();
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (request == null || request.getUrl() == null) return null;
        if (!HOST.equals(request.getUrl().getHost())) return null;

        String path = request.getUrl().getPath();
        if (path == null || path.isEmpty() || "/".equals(path)) path = "/index.html";
        if (path.startsWith("/")) path = path.substring(1);

        Map<String, String> headers = new HashMap<>();
        headers.put("Cache-Control", "no-store");

        try {
            if ("index.html".equals(path)) {
                String html = injectBootstrap(readAsset("www/index.html"));
                byte[] bytes = html.getBytes(UTF8);
                return new WebResourceResponse(
                        "text/html",
                        "utf-8",
                        200,
                        "OK",
                        headers,
                        new ByteArrayInputStream(bytes)
                );
            }
            InputStream stream = assets.open("www/" + path);
            return new WebResourceResponse(mime(path), "utf-8", 200, "OK", headers, stream);
        } catch (Exception e) {
            return new WebResourceResponse(
                    "text/plain",
                    "utf-8",
                    404,
                    "Not Found",
                    headers,
                    new ByteArrayInputStream(new byte[0])
            );
        }
    }

    private String injectBootstrap(String html) {
        String planner = SnapshotStore.planner(context);
        String literal = "null";
        if (SnapshotStore.looksLikePlanner(planner)) {
            literal = planner.replace("<", "\\u003c");
        }
        String tag = "<script>window.__DNEVNIK_NATIVE__=true;window.__DNEVNIK_BOOTSTRAP__="
                + literal
                + ";</script>";
        if (html.contains("</head>")) {
            return html.replace("</head>", tag + "</head>");
        }
        return tag + html;
    }

    private String readAsset(String path) throws Exception {
        InputStream in = assets.open(path);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        int n;
        while ((n = in.read(buf)) != -1) {
            out.write(buf, 0, n);
        }
        in.close();
        return new String(out.toByteArray(), UTF8);
    }

    @Override
    public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        String url = error != null ? error.getUrl() : "";
        if (url != null && url.contains(HOST)) {
            handler.proceed();
            return;
        }
        handler.cancel();
    }

    private static String mime(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html")) return "text/html";
        if (lower.endsWith(".js")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".json")) return "application/json";
        return "application/octet-stream";
    }
}