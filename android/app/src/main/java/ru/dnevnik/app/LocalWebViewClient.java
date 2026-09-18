package ru.dnevnik.app;

import android.content.res.AssetManager;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class LocalWebViewClient extends WebViewClient {
    static final String HOST = "dnevnik.local";
    private final AssetManager assets;

    LocalWebViewClient(AssetManager assets) {
        this.assets = assets;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (request == null || request.getUrl() == null) return null;
        if (!HOST.equals(request.getUrl().getHost())) return null;

        String path = request.getUrl().getPath();
        if (path == null || path.isEmpty() || "/".equals(path)) path = "/index.html";
        if (path.startsWith("/")) path = path.substring(1);

        try {
            InputStream stream = assets.open("www/" + path);
            Map<String, String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-store");
            return new WebResourceResponse(mime(path), "utf-8", 200, "OK", headers, stream);
        } catch (Exception e) {
            return new WebResourceResponse(
                    "text/plain",
                    "utf-8",
                    404,
                    "Not Found",
                    null,
                    new ByteArrayInputStream(new byte[0])
            );
        }
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