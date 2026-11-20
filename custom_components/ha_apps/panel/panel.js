/* HA Apps — custom sidebar panel: Supervisor-free add-on store UI.
 * Rendered by the HA frontend as <ha-apps-panel>; the hass object is
 * injected by the frontend and provides authenticated callApi access
 * to the ha_apps backend views. */
const TAG = "HA_APPS";
const PANEL_I18N = {
  "en": {
    "loading_catalog": "Loading catalog …",
    "catalog_empty": "Catalog is empty — click \"Refresh catalog\" to fetch the add-on repositories.",
    "catalog_failed": "Catalog could not be loaded (see console).",
    "refreshing": "Refreshing catalog (git pull) …",
    "catalog_updated": "Catalog updated",
    "sup_hassio_api": "calls Supervisor APIs — the built-in stub answers the boot calls, more complex features may be missing",
    "sup_hassio_role": "requests elevated Supervisor privileges — ignored here, the add-on may check for them",
    "sup_homeassistant_api": "wants the Home Assistant API via the Supervisor proxy — real calls will likely fail",
    "sup_services": "expects other add-ons as services (service discovery) — not available without a real Supervisor",
    "sup_discovery": "uses discovery messages — not available without a real Supervisor",
    "sup_auth_api": "wants real user authentication — will fail",
    "sup_docker_api": "wants to spawn containers itself — the Docker socket is not available",
    "sup_unknown": "not covered by the stub — functionality uncertain",
    "warn_title": "⚠️ This add-on calls Supervisor APIs:",
    "warn_tail": "It may start but will probably only work partially — or not at all.",
    "ok_no_deps": "✅ No Supervisor dependencies detected — good prospects.",
    "free_space": "Free disk space:",
    "below_min": "— below {min} MB, installation is blocked",
    "install_title": "Install \"{name}\"?",
    "image": "Image",
    "version": "Version",
    "source": "Source",
    "web_port": "Web port",
    "auto_setup": "⚙️ Auto-Setup: {notes}",
    "todo_after": "📋 Still to do after installation:",
    "pi_discovery": "This app would normally register itself with Home Assistant automatically — that does not work here. Add it yourself afterwards: Settings → Devices & services → + Add integration, using this machine's IP address and the shown port.",
    "pi_no_ingress": "The web UI does not run embedded (no ingress) — open it directly on the mapped port in your browser.",
    "pi_no_ingress_port": "This app has its own web page — it does not appear inside Home Assistant. Open it in your browser on this machine, port {port} (or click the Web UI button).",
    "pi_ingress_autopublish": "This app has its own web page — it does not appear inside Home Assistant. The store makes it reachable automatically during install — afterwards just click the Web UI button.",
    "loading_details": "Loading details …",
    "details_failed": "Details could not be loaded: {msg}",
    "back": "Back",
    "details_btn": "Details →",
    "back_to_store": "← Back to store",
    "disabled": "disabled",
    "size": "Size",
    "free_disk": "Free disk",
    "status": "Status",
    "update": "Update",
    "supervisor_apis": "Supervisor APIs",
    "arch": "Arch",
    "website": "Website",
    "ports": "Ports",
    "container": "Container",
    "host": "Host",
    "description": "Description",
    "options_defaults": "Options (defaults)",
    "readme": "Documentation",
    "full_docs": "Full documentation",
    "installed_state": "installed ({state})",
    "not_installed": "not installed",
    "installed_suffix": "(installed)",
    "download_mb": "~{mb} MB download",
    "unknown": "unknown",
    "available": "available",
    "none": "none",
    "supported": "supported",
    "not_supported": "not supported",
    "free_gb": "{gb} GB free",
    "free_mb": "{mb} MB free",
    "really_remove": "Really remove add-on \"{name}\"?",
    "data_kept": "(Data in /data is kept)",
    "install": "Install",
    "open_web_ui": "Open web UI",
    "stop": "Stop",
    "start": "Start",
    "logs": "Logs",
    "remove": "Remove",
    "update_action": "Update",
    "logs_title": "Logs — {slug}",
    "no_logs": "(no logs)",
    "disk_line": "Disk: {free} MB free",
    "disk_low_title": "Below {min} MB free — installations are blocked",
    "count_line": "{shown} of {total} add-ons",
    "update_badge": "update available",
    "sup_badge_title": "Uses Supervisor APIs ({keys}) — may be limited",
    "verified_badge": "verified",
    "verified_title": "Tested with auto-setup — will be fully configured",
    "disk_low_btn": "Not enough free disk space",
    "search_placeholder": "Search add-ons …",
    "all_sources": "All sources",
    "official": "Official",
    "community": "Community",
    "refresh_catalog": "Refresh catalog",
    "cancel": "Cancel",
    "port_btn": "Port {port}",
    "busy": "…",
    "count_installed": "({installed} installed)",
    "filter_btn": "Filter",
    "f_all": "all",
    "filter_hint": "click: include → exclude → off",
    "f_installed": "installed",
    "f_installable": "installable",
    "f_not_installable": "not installable",
    "f_running": "running",
    "f_stopped": "stopped",
    "f_supervisor": "supervisor",
    "f_special": "tested",
    "f_update": "update available",
    "tip_repo_official": "from the official home-assistant/addons catalog",
    "tip_repo_community": "from the community hassio-addons/repository catalog",
    "tip_state": "container status: {state}",
    "tip_state_running": "the container is running",
    "tip_state_exited": "the container is stopped",
    "tip_state_restarting": "the container keeps restarting — check Logs",
    "tip_state_paused": "the container is paused",
    "tip_state_created": "container created but never started",
    "tip_cpu_lacks": "the CPU lacks the '{flag}' instruction set — this add-on would crash (SIGILL)",
    "tip_unsupported": "cannot be installed on this machine: {reason}",
    "tip_update": "a newer version is available — Update pulls it",
    "tip_dl_size": "estimated compressed download size",
    "tip_disk": "free disk space under {dir}",
    "remove_title": "Remove \"{name}\"?",
    "remove_keep": "Keep data",
    "remove_purge": "Delete data too",
    "remove_keep_hint": "Settings and files under /data are kept — a reinstall restores them.",
    "remove_purge_hint": "Settings and files under /data are deleted permanently.",
    "local": "local",
    "tip_repo_local": "your own add-ons, built locally from a Dockerfile"
  },
  "de": {
    "loading_catalog": "Lade Katalog …",
    "catalog_empty": "Katalog leer — „Katalog aktualisieren\" klicken, um die Add-on-Repos zu laden.",
    "catalog_failed": "Katalog konnte nicht geladen werden (siehe Konsole).",
    "refreshing": "Aktualisiere Katalog (git pull) …",
    "catalog_updated": "Katalog aktualisiert",
    "sup_hassio_api": "ruft Supervisor-APIs ab — der eingebaute Stub beantwortet die Boot-Calls, komplexere Funktionen können fehlen",
    "sup_hassio_role": "fordert höhere Supervisor-Rechte — wird ignoriert, das Add-on prüft evtl. darauf",
    "sup_homeassistant_api": "will die Home-Assistant-API über den Supervisor-Proxy — echte Calls schlagen wahrscheinlich fehl",
    "sup_services": "erwartet andere Add-ons als Dienste (Service Discovery) — ohne echten Supervisor nicht vorhanden",
    "sup_discovery": "nutzt Discovery-Nachrichten — ohne echten Supervisor nicht vorhanden",
    "sup_auth_api": "will echte Benutzer-Authentifizierung — schlägt fehl",
    "sup_docker_api": "will selbst Container starten — Docker-Socket ist nicht verfügbar",
    "sup_unknown": "nicht vom Stub abgedeckt — Funktion fraglich",
    "warn_title": "⚠️ Dieses Add-on ruft Supervisor-APIs auf:",
    "warn_tail": "Es startet möglicherweise, läuft aber evtl. nur eingeschränkt — oder gar nicht.",
    "ok_no_deps": "✅ Keine Supervisor-Abhängigkeiten erkannt — gute Aussichten.",
    "free_space": "Freier Speicher:",
    "below_min": "— unter {min} MB, Installation wird blockiert",
    "install_title": "„{name}\" installieren?",
    "image": "Image",
    "version": "Version",
    "source": "Quelle",
    "web_port": "Web-Port",
    "auto_setup": "⚙️ Auto-Setup: {notes}",
    "todo_after": "📋 Nach der Installation noch zu tun:",
    "pi_discovery": "Diese App würde sich normalerweise automatisch bei Home Assistant anmelden — das geht hier nicht. Danach selbst einrichten: Einstellungen → Geräte & Dienste → + Integration hinzufügen, mit der IP dieses Rechners und dem angezeigten Port.",
    "pi_no_ingress": "Die Weboberfläche läuft nicht eingebettet (kein Ingress) — im Browser direkt über den gemappten Port öffnen.",
    "pi_no_ingress_port": "Diese App hat eine eigene Webseite — sie erscheint nicht direkt in Home Assistant. Im Browser auf diesem Rechner über Port {port} öffnen (oder auf den Web-UI-Button klicken).",
    "pi_ingress_autopublish": "Diese App hat eine eigene Webseite — sie erscheint nicht direkt in Home Assistant. Der Store macht sie beim Installieren automatisch erreichbar — danach einfach auf den Web-UI-Button klicken.",
    "loading_details": "Lade Details …",
    "details_failed": "Details konnten nicht geladen werden: {msg}",
    "back": "Zurück",
    "details_btn": "Details →",
    "back_to_store": "← Zurück zum Store",
    "disabled": "deaktiviert",
    "size": "Größe",
    "free_disk": "Freier Speicher",
    "status": "Status",
    "update": "Update",
    "supervisor_apis": "Supervisor-APIs",
    "arch": "Arch",
    "website": "Webseite",
    "ports": "Ports",
    "container": "Container",
    "host": "Host",
    "description": "Beschreibung",
    "options_defaults": "Optionen (Defaults)",
    "readme": "Dokumentation",
    "full_docs": "Vollständige Doku",
    "installed_state": "installiert ({state})",
    "not_installed": "nicht installiert",
    "installed_suffix": "(installiert)",
    "download_mb": "~{mb} MB Download",
    "unknown": "unbekannt",
    "available": "verfügbar",
    "none": "keine",
    "supported": "unterstützt",
    "not_supported": "nicht unterstützt",
    "free_gb": "{gb} GB frei",
    "free_mb": "{mb} MB frei",
    "really_remove": "Add-on „{name}\" wirklich entfernen?",
    "data_kept": "(Daten in /data bleiben erhalten)",
    "install": "Installieren",
    "open_web_ui": "Web-UI öffnen",
    "stop": "Stop",
    "start": "Start",
    "logs": "Logs",
    "remove": "Entfernen",
    "update_action": "Update",
    "logs_title": "Logs — {slug}",
    "no_logs": "(keine Logs)",
    "disk_line": "Disk: {free} MB frei",
    "disk_low_title": "Unter {min} MB frei — Installationen werden blockiert",
    "count_line": "{shown} von {total} Add-ons",
    "update_badge": "update verfügbar",
    "sup_badge_title": "Nutzt Supervisor-APIs ({keys}) — evtl. eingeschränkt",
    "verified_badge": "getestet",
    "verified_title": "Mit Auto-Setup getestet — wird vollständig eingerichtet",
    "disk_low_btn": "Zu wenig freier Speicher",
    "search_placeholder": "Add-ons durchsuchen …",
    "all_sources": "Alle Quellen",
    "official": "Offiziell",
    "community": "Community",
    "refresh_catalog": "Katalog aktualisieren",
    "cancel": "Abbrechen",
    "port_btn": "Port {port}",
    "busy": "…",
    "count_installed": "({installed} installiert)",
    "filter_btn": "Filter",
    "f_all": "alle",
    "filter_hint": "Klick: einschließen → ausschließen → aus",
    "f_installed": "installiert",
    "f_installable": "installierbar",
    "f_not_installable": "nicht installierbar",
    "f_running": "läuft",
    "f_stopped": "gestoppt",
    "f_supervisor": "supervisor",
    "f_special": "getestet",
    "f_update": "update verfügbar",
    "tip_repo_official": "aus dem offiziellen home-assistant/addons-Katalog",
    "tip_repo_community": "aus dem Community-Katalog hassio-addons/repository",
    "tip_state": "Container-Status: {state}",
    "tip_state_running": "der Container läuft",
    "tip_state_exited": "der Container ist gestoppt",
    "tip_state_restarting": "der Container startet ständig neu — Logs prüfen",
    "tip_state_paused": "der Container ist pausiert",
    "tip_state_created": "Container erstellt, aber nie gestartet",
    "tip_cpu_lacks": "der CPU fehlt der '{flag}'-Befehlssatz — das Add-on würde abstürzen (SIGILL)",
    "tip_unsupported": "auf diesem Rechner nicht installierbar: {reason}",
    "tip_update": "eine neuere Version ist verfügbar — Update lädt sie",
    "tip_dl_size": "geschätzte komprimierte Downloadgröße",
    "tip_disk": "freier Speicherplatz unter {dir}",
    "remove_title": "„{name}\" entfernen?",
    "remove_keep": "Daten behalten",
    "remove_purge": "Daten ebenfalls löschen",
    "remove_keep_hint": "Einstellungen und Dateien unter /data bleiben erhalten — eine Neuinstallation stellt sie wieder her.",
    "remove_purge_hint": "Einstellungen und Dateien unter /data werden dauerhaft gelöscht.",
    "local": "lokal",
    "tip_repo_local": "eigene Add-ons, lokal aus einem Dockerfile gebaut"
  }
};


const TAG_FILTERS = {
  installed:        (a) => a.installed,
  installable:      (a) => a.supported,
  not_installable:  (a) => !a.supported,
  running:          (a) => a.installed && a.state === "running",
  stopped:          (a) => a.installed && a.state !== "running",
  supervisor:       (a) => !!(a.needs_supervisor && a.needs_supervisor.length),
  special:          (a) => !!a.special,
  update:           (a) => !!a.update_available,
};

class HaAppsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._addons = [];
    this._filter = "";
    this._repo = "all";
    this._tags = this._loadTags();
    this._busy = new Set();
    this._detail = null;
    this._verified = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._rendered = true;
      this._render();
      this._load();
    }
  }

  connectedCallback() {
    this._focusSearch();
  }

  _focusSearch() {
    requestAnimationFrame(() => {
      const q = this.shadowRoot?.querySelector("#q");
      if (q && q.isConnected && !q.value) q.focus();
    });
  }

  async _api(method, path, body) {
    try {
      return await this._hass.callApi(method, `ha_apps/${path}`, body);
    } catch (err) {
      console.error(`[${TAG}] ${method} ${path} failed`, err);
      this._toast(err.message || String(err), true);
      throw err;
    }
  }


  _note(n) {
    /* post_install notes can be plain strings or {"key", "text"} pairs;
       keyed entries go through _t so the panel renders them localized */
    if (typeof n === "string") return n;
    const v = this._t(n.key, n.params);
    return v === n.key ? n.text || n.key : v;
  }

  _t(key, params) {
    /* HA's localize() only has resources for domains the frontend loaded;
       custom-component panel strings are usually not among them, so fall
       back to the embedded map keyed by the user's UI language. */
    const v = this._hass?.localize?.(`component.ha_apps.panel.${key}`, params);
    if (v) return v;
    const lang = (this._hass?.language || "en").startsWith("de") ? "de" : "en";
    let out = (PANEL_I18N[lang] && PANEL_I18N[lang][key]) || PANEL_I18N.en[key] || key;
    if (params)
      for (const [k, val] of Object.entries(params))
        out = out.replace("{" + k + "}", val);
    return out;
  }

  async _load() {
    const cached = this._loadAddons();
    if (cached.length && !this._addons.length) {
      // stale-while-revalidate: cached list renders instantly, the
      // fresh fetch below replaces it once the CLI round-trip lands
      this._addons = cached;
      this._renderList();
    } else {
      this._setStatus(this._t("loading_catalog"));
    }
    this._status = this._loadStatus();
    this._renderDisk();
    this._refreshing = true;
    this._syncRefresh();
    try {
      const fresh = await this._api("GET", "status").catch(() => null);
      if (fresh) {
        this._status = fresh;
        this._saveStatus(fresh);
      }
      this._renderDisk();
      const addons = await this._api("GET", "addons");
      this._addons = addons;
      this._verified = true;
      this._saveAddons(addons);
      if (this._addons.length === 0) {
        this._setStatus(
          this._t("catalog_empty")
        );
        return;
      }
      this._renderList();
    } catch (_err) {
      if (!this._addons.length) this._setStatus(this._t("catalog_failed"));
    } finally {
      this._refreshing = false;
      this._syncRefresh();
    }
  }

  _syncRefresh() {
    const b = this.shadowRoot.querySelector("#refresh");
    if (!b) return;
    b.disabled = !!this._refreshing;
    b.innerHTML = this._refreshing ? '<span class="spin"></span>' : "⟳";
  }

  async _refreshCatalog() {
    this._setStatus(this._t("refreshing"));
    this._refreshing = true;
    this._syncRefresh();
    const res = await this._api("POST", "catalog/refresh");
    this._toast(res.output || this._t("catalog_updated"));
    await this._load();
  }

  _supExplanation(keys) {
    return keys.map((k) => {
      const txt = this._t("sup_" + k);
      return `<li><code>${k}</code>: ${txt === "sup_" + k ? this._t("sup_unknown") : txt}</li>`;
    }).join("");
  }

  _confirmInstall(a) {
    const dlg = this.shadowRoot.querySelector("#instdlg");
    const sup = a.needs_supervisor || [];
    const warn = sup.length
      ? `<div class="warnbox">${this._t("warn_title")}<ul>${this._supExplanation(sup)}</ul>${this._t("warn_tail")}</div>`
      : `<div class="okbox">${this._t("ok_no_deps")}</div>`;
    const disk = this._status
      ? `<p>${this._t("free_space")} <strong>${this._status.disk_free_mb} MB</strong>` +
        `${this._diskLow ? ` <span class="badtext">${this._t("below_min", {min: this._status.min_free_mb})}</span>` : ""}</p>`
      : "";
    dlg.querySelector(".dlgbody").innerHTML = `
      <h3>${this._t("install_title", {name: a.name})}</h3>
      <table class="meta">
        <tr><th>${this._t("image")}</th><td><code>${a.image || "?"}</code></td></tr>
        <tr><th>${this._t("version")}</th><td>${a.version || "?"}</td></tr>
        <tr><th>${this._t("source")}</th><td>${a.repo}</td></tr>
        ${a.webui_port ? `<tr><th>${this._t("web_port")}</th><td>${a.webui_port}</td></tr>` : ""}
      </table>
      ${disk}
      ${warn}
      ${a.special
        ? `<div class="okbox">${this._t("auto_setup", {notes: (a.special.auto || []).join("; ")})}</div>`
        : ""}
      ${(a.post_install || []).length
        ? `<div class="notebox">${this._t("todo_after")}<ul>` +
          a.post_install.map((n) => `<li>${this._note(n)}</li>`).join("") +
          `</ul></div>`
        : ""}`;
    dlg.querySelector("#dlggo").disabled = !!this._diskLow;
    dlg.showModal();
    const go = dlg.querySelector("#dlggo");
    const fresh = go.cloneNode(true);
    go.replaceWith(fresh);
    fresh.addEventListener("click", () => {
      dlg.close();
      this._action(a.slug, "install");
    });
    dlg.querySelector("#dlgcancel").onclick = () => dlg.close();
  }

  _confirmRemove(a) {
    const dlg = this.shadowRoot.querySelector("#rmdlg");
    dlg.querySelector(".dlgbody").innerHTML = `
      <h3>${this._t("remove_title", {name: a.name})}</h3>
      <div class="notebox"><strong>${this._t("remove_keep")}</strong> — ${this._t("remove_keep_hint")}</div>
      <div class="warnbox" style="margin-top:8px"><strong>${this._t("remove_purge")}</strong> — ${this._t("remove_purge_hint")}</div>`;
    dlg.showModal();
    const wire = (id, fn) => {
      const el = dlg.querySelector(id);
      const fresh = el.cloneNode(true);
      el.replaceWith(fresh);
      fresh.addEventListener("click", fn);
    };
    wire("#rmkeep", () => {
      dlg.close();
      this._action(a.slug, "remove", false);
    });
    wire("#rmpurge", () => {
      dlg.close();
      this._action(a.slug, "remove", true);
    });
    wire("#rmcancel", () => dlg.close());
  }

  async _action(slug, action, purge = false) {
    this._busy.add(slug);
    this._renderList();
    this._syncDetailActions();
    try {
      const res = await this._api("POST", `addon/${slug}/action`, {
        action,
        purge,
      });
      this._toast(res.output || `${slug}: ${action} OK`);
    } catch (_err) {
      /* toast already shown */
    } finally {
      this._busy.delete(slug);
      await this._load();
      if (this._detail?.slug === slug) {
        const fresh = await this._api("GET", `addon/${slug}`).catch(() => null);
        if (fresh)
          this._renderDetail(this._detail.el, fresh, this._detail.markdown);
      }
    }
  }

  _syncDetailActions() {
    const d = this._detail;
    if (!d?.a) return;
    const actions = d.el.querySelector(".dactions");
    if (!actions) return;
    actions.innerHTML = this._actionButtons(d.a);
    this._wireDetailActions(d.el, d.a);
  }

  _md(src, repo, slug) {
    // minimal markdown: headings, bold/italic, inline code, fenced code,
    // links, images (relative paths resolved against the repo cache), lists
    const esc = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const raw = (p) =>
      p.startsWith("http") ? p : `/api/ha_apps/raw/${repo}/${slug}/${p}`;
    let html = esc(src);
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g,
      (_m, _l, c) => `<pre><code>${c.trimEnd()}</code></pre>`);
    html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g,
      (_m, alt, src2) => `<img class="mdimg" src="${raw(src2)}" alt="${alt}">`);
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g,
      (_m, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
    html = html.replace(/^###### (.*)$/gm, "<h6>$1</h6>")
      .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
      .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
      .replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    html = html.replace(/^(?:-|\*) (.*)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");
    html = html.replace(/^(?!<[a-z]|$)(.*)$/gm, "<p>$1</p>");
    return html;
  }

  async _openDetail(slug) {
    const detail = this.shadowRoot.querySelector("#detail");
    detail.style.display = "block";
    this.shadowRoot.querySelector("#browser").style.display = "none";
    detail.innerHTML = "<p>" + this._t("loading_details") + "</p>";
    try {
      const entry = this._addons.find((x) => x.slug === slug);
      const repo = entry?.repo || "";
      const dir = entry?.dir || slug;
      const [info, readme] = await Promise.all([
        this._api("GET", `addon/${slug}`),
        this._api("GET", `readme/${repo}/${dir}`)
          .catch(() => ({ markdown: "" })),
      ]);
      this._renderDetail(detail, info, readme.markdown || "");
    } catch (err) {
      const msg = err?.error || err?.message || JSON.stringify(err);
      console.error("[HA_APPS] detail load failed:", slug, err);
      detail.innerHTML =
        `<p>${this._t("details_failed", {msg})}</p>` +
        `<button id="dback">${this._t("back")}</button>`;
    }
    detail.querySelector("#dback")?.addEventListener("click", () =>
      this._showList()
    );
  }

  _showList() {
    this._detail = null;
    this.shadowRoot.querySelector("#detail").style.display = "none";
    this.shadowRoot.querySelector("#browser").style.display = "block";
  }

  _renderDetail(detail, a, markdown) {
    this._detail = { slug: a.slug, el: detail, a, markdown };
    const optRows = Object.entries(a.options || {}).map(
      ([k, v]) =>
        `<tr><td><code>${k}</code></td><td>${JSON.stringify(v)}</td></tr>`
    );
    const portRows = Object.entries(a.ports || {}).map(
      ([c, h]) =>
        `<tr><td><code>${c}</code></td><td>${h ?? this._t("disabled")}</td>` +
        `<td>${a.ports_description?.[c] || ""}</td></tr>`
    );
    const meta = [
      [this._t("version"), a.version],
      [this._t("source"), a.repo],
      [this._t("image"), `<code>${a.image || "?"}</code>`],
      [
        this._t("size"),
        (a.image_size
          ? `${a.image_size} ${this._t("installed_suffix")}`
          : a.download_size_mb
            ? this._t("download_mb", {mb: a.download_size_mb})
            : this._t("unknown")) + (a.size_note ? ` — ${a.size_note}` : ""),
      ],
      [
        this._t("free_disk"),
        this._status
          ? this._status.disk_free_mb > 1024
            ? this._t("free_gb", {gb: (this._status.disk_free_mb / 1024).toFixed(1)})
            : this._t("free_mb", {mb: this._status.disk_free_mb})
          : "?",
      ],
      [this._t("status"), a.installed ? this._t("installed_state", {state: a.state}) : this._t("not_installed")],
      [this._t("update"), a.update_available ? this._t("available") : "—"],
      [
        this._t("supervisor_apis"),
        a.needs_supervisor?.length
          ? a.needs_supervisor.join(", ")
          : this._t("none"),
      ],
      [this._t("arch"), a.supported ? this._t("supported") : a.unsupported_reason],
      [
        this._t("website"),
        a.url ? `<a href="${a.url}" target="_blank" rel="noopener">${a.url}</a>` : "—",
      ],
    ];
    detail.innerHTML = `
      <button id="dback">${this._t("back_to_store")}</button>
      <div class="dhead">
        ${a.icon ? `<img src="${a.icon}" alt="">` : ""}
        <div><h2>${a.name}</h2>
        <div class="ver">v${a.version || "?"} — ${a.description || ""}</div></div>
      </div>
      <div class="dactions">${this._actionButtons(a)}</div>
      <table class="meta">${meta
        .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
        .join("")}</table>
      ${(a.post_install || []).length
        ? `<div class="notebox">${this._t("todo_after")}<ul>` +
          a.post_install.map((n) => `<li>${this._note(n)}</li>`).join("") +
          `</ul></div>`
        : ""}
      ${portRows.length ? `<h3>${this._t("ports")}</h3><table class="meta"><tr><th>${this._t("container")}</th><th>${this._t("host")}</th><th>${this._t("description")}</th></tr>${portRows.join("")}</table>` : ""}
      ${optRows.length ? `<h3>${this._t("options_defaults")}</h3><table class="meta">${optRows.join("")}</table>` : ""}
      ${markdown ? `<h3>${this._t("readme")}</h3><div class="md">${this._md(this._firstBlocks(markdown, 2), a.repo, a.dir || a.slug)}</div><details class="fulldocs"><summary>${this._t("full_docs")}</summary><div class="md">${this._md(markdown, a.repo, a.dir || a.slug)}</div></details>` : ""}
      <button id="dback2">${this._t("back_to_store")}</button>`;
    detail.querySelectorAll("#dback,#dback2").forEach((b) =>
      b.addEventListener("click", () => this._showList())
    );
    this._wireDetailActions(detail, a);
  }

  _wireDetailActions(detail, a) {
    detail.querySelectorAll("button[data-act]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const act = btn.dataset.act;
        if (act === "logs") {
          this._showLogs(a.slug);
        } else if (act === "install") {
          this._confirmInstall(a);
        } else if (act === "remove") {
          await this._confirmRemove(a);
        } else {
          await this._action(a.slug, act);
        }
      });
    });
  }

  _actionButtons(a) {
    if (this._busy.has(a.slug))
      return `<button disabled class="busy"><span class="spin"></span>${this._t("busy")}</button>`;
    const buttons = [];
    if (!a.installed && !a.supported) {
      return `<span class="badge err">${a.unsupported_reason || this._t("not_supported")}</span>`;
    }
    if (!a.installed) {
      buttons.push(
        `<button class="primary" data-act="install" ` +
          `${this._diskLow ? 'disabled title="' + this._t('disk_low_btn') + '"' : ""}>` +
          `${this._t("install")}</button>`
      );
    } else {
      if (a.state === "running") {
        buttons.push(`<button data-act="stop">${this._t("stop")}</button>`);
        if (a.webui_port)
          buttons.push(
            `<a class="btn primary" href="${this._webuiUrl(a)}" ` +
            `target="_blank" rel="noopener">${this._t("open_web_ui")}</a>`
          );
        for (const p of a.extra_ports || [])
          buttons.push(
            p === a.webui_port
              ? `<span class="portnum">${this._t("port_btn", {port: p})}</span>`
              : `<a class="btn" href="${this._portUrl(p)}" target="_blank" rel="noopener">` +
                `${this._t("port_btn", {port: p})}</a>`
          );
      } else {
        buttons.push(`<button class="primary" data-act="start">${this._t("start")}</button>`);
      }
      if (a.update_available)
        buttons.push(`<button data-act="update">${this._t("update_action")}</button>`);
      buttons.push(`<button data-act="logs">${this._t("logs")}</button>`);
      buttons.push(`<button class="danger" data-act="remove">${this._t("remove")}</button>`);
    }
    return buttons.join("");
  }

  async _showLogs(slug) {
    const res = await this._api("GET", `addon/${slug}/logs`);
    const dlg = this.shadowRoot.querySelector("#logdlg");
    dlg.querySelector("pre").textContent = res.logs || this._t("no_logs");
    dlg.querySelector("h3").textContent = this._t("logs_title", {slug});
    dlg.showModal();
  }

  _toast(msg, isErr = false) {
    const t = this.shadowRoot.querySelector("#toast");
    t.textContent = msg;
    t.className = isErr ? "err show" : "show";
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove("show"), 6000);
  }

  _renderDisk() {
    const el = this.shadowRoot.querySelector("#disk");
    const s = this._status;
    if (!s) {
      el.textContent = "";
      return;
    }
    const low = s.disk_free_mb < s.min_free_mb;
    el.textContent = this._t("disk_line", {free: s.disk_free_mb});
    el.className = low ? "disk low" : "disk";
    el.title = low
      ? this._t("disk_low_title", {min: s.min_free_mb})
      : this._t("tip_disk", {dir: s.disk_dir || ""});
    this._diskLow = low;
  }

  _host() {
    const h = location.hostname;
    return h.includes(":") ? `[${h}]` : h;
  }

  _portUrl(port) {
    return `http://${this._host()}:${port}/`;
  }

  _webuiUrl(a) {
    return a.webui_url
      ? a.webui_url.replace("[HOST]", this._host())
      : this._portUrl(a.webui_port);
  }

  _syncFilterMenu() {
    const menu = this.shadowRoot.querySelector("#fltmenu");
    if (!menu) return;
    menu.querySelectorAll('input[type=checkbox]').forEach((c) => {
      const v = this._tags.get(c.value) || 0;
      c.checked = c.value === "all" ? this._tags.size === 0 : v === 1;
      c.indeterminate = c.value !== "all" && v === -1;
      c.parentElement.classList.toggle("excl", v === -1);
    });
    const btn = this.shadowRoot.querySelector("#fltbtn");
    btn.textContent = this._t("filter_btn") + (this._tags.size ? ` (${this._tags.size}) ▾` : " ▾");
  }

  _setStatus(msg) {
    this.shadowRoot.querySelector("#status").textContent = msg;
    this.shadowRoot.querySelector("#grid").innerHTML = "";
  }

  _loadTags() {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("ha-apps-tags") || "[]"
      );
      if (!saved.every((e) => Array.isArray(e) && e.length === 2))
        throw new Error("bad shape");
      return new Map(saved);
    } catch (e) {
      console.warn("[APPS] saved tag filter unreadable, resetting:", e);
      return new Map();
    }
  }

  _saveTags() {
    sessionStorage.setItem("ha-apps-tags", JSON.stringify([...this._tags]));
  }

  _loadAddons() {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("ha-apps-addons") || "[]"
      );
      if (!Array.isArray(saved)) throw new Error("bad shape");
      return saved;
    } catch (e) {
      console.warn("[APPS] saved catalog unreadable, resetting:", e);
      return [];
    }
  }

  _saveAddons(addons) {
    sessionStorage.setItem("ha-apps-addons", JSON.stringify(addons));
  }

  _firstBlocks(src, n) {
    return src.split(/\n\s*\n/).slice(0, n).join("\n\n");
  }

  _loadStatus() {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("ha-apps-status") || "null"
      );
      if (saved && typeof saved !== "object") throw new Error("bad shape");
      return saved;
    } catch (e) {
      console.warn("[APPS] saved status unreadable, resetting:", e);
      return null;
    }
  }

  _saveStatus(status) {
    sessionStorage.setItem("ha-apps-status", JSON.stringify(status));
  }

  _filtered() {
    const q = this._filter.toLowerCase();
    return this._addons
      .filter(
        (a) =>
          (this._repo === "all" || a.repo === this._repo) &&
          [...this._tags].every(([t, v]) =>
            (v === 1 ? TAG_FILTERS[t](a) : !TAG_FILTERS[t](a))) &&
          (!q ||
            a.name.toLowerCase().includes(q) ||
            a.slug.includes(q) ||
            (a.description || "").toLowerCase().includes(q))
      )
      .sort((a, b) => b.installed - a.installed || a.name.localeCompare(b.name));
  }

  /* Buttons that mirror the cached install state (stop/webui/ports,
     logs) — `mutating` adds update + remove, which only appear once
     the fresh list confirmed the state. */
  _stateButtons(a, buttons, mutating) {
    if (a.state === "running") {
      buttons.push(`<button data-act="stop">${this._t("stop")}</button>`);
      if (a.webui_port)
        buttons.push(
          `<a class="btn primary" href="${this._webuiUrl(a)}" ` +
          `target="_blank" rel="noopener">${this._t("open_web_ui")}</a>`
        );
      for (const p of a.extra_ports || [])
        buttons.push(
          p === a.webui_port
            ? `<span class="portnum">${this._t("port_btn", {port: p})}</span>`
            : `<a class="btn" href="${this._portUrl(p)}" target="_blank" rel="noopener">` +
              `${this._t("port_btn", {port: p})}</a>`
        );
    } else {
      buttons.push(`<button class="primary" data-act="start">${this._t("start")}</button>`);
    }
    if (mutating && a.update_available)
      buttons.push(`<button data-act="update">${this._t("update_action")}</button>`);
    buttons.push(`<button data-act="logs">${this._t("logs")}</button>`);
    if (mutating)
      buttons.push(`<button class="danger" data-act="remove">${this._t("remove")}</button>`);
  }

  _renderList() {
    const list = this._filtered();
    const grid = this.shadowRoot.querySelector("#grid");
    const st = this.shadowRoot.querySelector("#status");
    st.innerHTML =
      this._t("count_line", {shown: list.length, total: this._addons.length}) +
      ` <a href="#" id="instlink">${this._t("count_installed", {installed: this._addons.filter((a) => a.installed).length})}</a>`;
    st.querySelector("#instlink").addEventListener("click", (e) => {
      e.preventDefault();
      this._tags = new Map([["installed", 1]]);
      this._saveTags();
      this._syncFilterMenu();
      this._renderList();
    });
    grid.innerHTML = "";
    for (const a of list) grid.appendChild(this._card(a));
  }

  _card(a) {
    const busy = this._busy.has(a.slug);
    const card = document.createElement("div");
    card.className = "card" + (a.supported ? "" : " unsupported");
    const badges = [];
    const tip = (s) => ` title="${s.replace(/"/g, "&quot;")}" data-tip="${s.replace(/"/g, "&quot;")}"`;
    badges.push(
      `<span class="badge repo-${a.repo}"${tip(this._t("tip_repo_" + a.repo) === "tip_repo_" + a.repo ? a.repo : this._t("tip_repo_" + a.repo))}>${a.repo}</span>`
    );
    if (a.installed) {
      const stateTip =
        this._t("tip_state_" + a.state) === "tip_state_" + a.state
          ? this._t("tip_state", {state: a.state})
          : this._t("tip_state_" + a.state);
      badges.push(
        `<span class="badge ${a.state === "running" ? "ok" : "warn"}"${tip(stateTip)}>${a.state}</span>`
      );
      if (a.update_available)
        badges.push(`<span class="badge upd"${tip(this._t("tip_update"))}>${this._t("update_badge")}</span>`);
    }
    if (a.special)
      badges.push(
        `<span class="badge special"${tip(this._t("verified_title"))}>${this._t("verified_badge")}</span>`
      );
    if (a.needs_supervisor && a.needs_supervisor.length)
      badges.push(
        `<span class="badge sup"${tip(this._t("sup_badge_title", {keys: a.needs_supervisor.join(", ")}))}>supervisor</span>`
      );
    if (!a.supported) {
      const reason = a.unsupported_reason || this._t("not_supported");
      const m = /^cpu lacks (.+)$/.exec(reason);
      badges.push(
        `<span class="badge err"${tip(m ? this._t("tip_cpu_lacks", {flag: m[1]}) : this._t("tip_unsupported", {reason}))}>${reason}</span>`
      );
    }

    const buttons = [];
    if (!this._verified && a.installed) {
      /* cached card — mutating actions wait for the fresh install
         state, the read-only buttons render from cache */
      this._stateButtons(a, buttons, false);
    } else if (!this._verified) {
      /* cached card, not installed — install button waits for the
         fresh list */
    } else if (busy) {
      buttons.push(`<button disabled class="busy"><span class="spin"></span>${this._t("busy")}</button>`);
    } else if (!a.installed && !a.supported) {
      /* no actions */
    } else if (!a.installed) {
      buttons.push(
        `<button class="primary" data-act="install" ` +
          `${this._diskLow ? 'disabled title="' + this._t('disk_low_btn') + '"' : ""}>` +
          `${this._t("install")}</button>` +
          (a.download_size_mb
            ? `<span class="freedisk${this._diskLow ? " low" : ""}">` +
              `~${a.download_size_mb} MB</span>`
            : "")
      );
    } else {
      this._stateButtons(a, buttons, true);
    }

    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      if (e.target.closest("button,a")) return;
      const tipEl = e.target.closest("[data-tip]");
      if (tipEl) {
        this._toast(tipEl.dataset.tip);
        return;
      }
      this._openDetail(a.slug);
    });
    card.innerHTML = `
      <div class="head">
        ${a.icon ? `<img src="${a.icon}" alt="" onerror="this.style.display='none'">` : '<div class="noicon">🧩</div>'}
        <div class="titles">
          <div class="name">${a.name}</div>
          <div class="ver">v${a.version || "?"}</div>
        </div>
      </div>
      <div class="desc">${a.description || ""}</div>
      <div class="size">${a.image_size ? `💾 ${a.image_size}` : a.download_size_mb ? `💾 ~${a.download_size_mb} MB` : ""}</div>
      <div class="badges">${badges.join(" ")}</div>
      <div class="actions">${buttons.join("")}<button data-detail="${a.slug}">${this._t("details_btn")}</button></div>`;

    card.querySelectorAll("button[data-act],button[data-detail]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.detail) {
          this._openDetail(btn.dataset.detail);
          return;
        }
        const act = btn.dataset.act;
        if (act === "logs") {
          this._showLogs(a.slug);
        } else if (act === "install") {
          this._confirmInstall(a);
        } else if (act === "remove") {
          this._confirmRemove(a);
        } else {
          this._action(a.slug, act);
        }
      });
    });
    return card;
  }

  _render() {
    this.shadowRoot.innerHTML = `
    <style>
      :host { display:block; padding:16px; font-family:var(--paper-font-body1_-_font-family, Roboto, sans-serif); color:var(--primary-text-color,#eee); }
      .bar { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:14px; }
      h1 { font-size:22px; margin:0; flex:0 0 auto; }
      input[type=search] { flex:1; min-width:180px; padding:8px 12px; border-radius:8px; border:1px solid #555; background:var(--card-background-color,#1c1c1c); color:inherit; font-size:14px; }
      select { padding:8px; border-radius:8px; border:1px solid #555; background:var(--card-background-color,#1c1c1c); color:inherit; }
      #grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; }
      .card { background:var(--card-background-color,#1e1e1e); border:1px solid #333; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:8px; }
      .card.unsupported { opacity:.55; }
      .head { display:flex; gap:10px; align-items:center; }
      .head img { width:44px; height:44px; border-radius:8px; }
      .noicon { width:44px; height:44px; border-radius:8px; background:#333; display:flex; align-items:center; justify-content:center; font-size:22px; }
      .name { font-weight:600; font-size:15px; }
      .ver { font-size:12px; opacity:.7; }
      .desc { font-size:13px; opacity:.85; min-height:34px; }
      .badges { display:flex; gap:6px; flex-wrap:wrap; }
      .size { font-size:12px; opacity:.7; min-height:14px; }
      .freedisk { font-size:11px; opacity:.7; align-self:center; }
      .freedisk.low { color:#f87171; opacity:1; }
      .badge { font-size:11px; padding:2px 8px; border-radius:10px; background:#333; }
      .badge.repo-official { background:#1d4ed8; }
      .badge.repo-community { background:#7c3aed; }
      .badge.repo-local { background:#0d9488; }
      .badge.ok { background:#15803d; }
      .badge.warn { background:#a16207; }
      .badge.err { background:#b91c1c; }
      .badge.sup { background:#9d5c00; }
      .badge.special { background:#15803d; }
      .badge.upd { background:#0369a1; }
      .actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:auto; }
      button, a.btn { padding:7px 14px; border-radius:8px; border:1px solid #555; background:transparent; color:inherit; cursor:pointer; font-size:13px; }
      a.btn { display:inline-block; text-decoration:none; }
      button:hover:not(:disabled), a.btn:hover { background:#ffffff18; }
      button.primary, a.btn.primary { background:var(--primary-color,#03a9f4); border-color:transparent; color:#fff; }
      button.danger { color:#f87171; border-color:#7f1d1d; }
      button:disabled { opacity:.5; cursor:default; }
      button.busy { opacity:.8; cursor:progress; }
      .spin { display:inline-block; width:11px; height:11px; margin-right:6px; vertical-align:-1px; border:2px solid currentColor; border-right-color:transparent; border-radius:50%; animation:haapps-spin .7s linear infinite; }
      @keyframes haapps-spin { to { transform:rotate(360deg); } }
      .portnum { font-size:12px; opacity:.7; padding:7px 4px; }
      #status { font-size:13px; opacity:.7; margin-bottom:10px; }
      #status a { color:var(--primary-color,#03a9f4); }
      .disk { font-size:12px; opacity:.8; padding:6px 10px; border-radius:8px; background:#333; }
      .disk.low { background:#b91c1c; color:#fff; opacity:1; }
      #fltwrap { position:relative; }
      #fltmenu { position:absolute; top:110%; left:0; z-index:5; background:var(--card-background-color,#222); border:1px solid var(--divider-color,#555); border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; gap:6px; min-width:170px; box-shadow:0 4px 14px #0006; }
      #fltmenu label { display:flex; gap:8px; align-items:center; font-size:13px; white-space:nowrap; cursor:pointer; }
      #fltmenu label.excl { color:#f87171; text-decoration:line-through; }
      #fltmenu input:indeterminate { accent-color:#b91c1c; }
      #fltmenu input:checked:not([value=all]) { accent-color:#15803d; }
      #fltmenu .flthint { font-size:11px; opacity:.55; margin-top:4px; }
      #toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#222; border:1px solid #555; padding:10px 18px; border-radius:10px; max-width:80%; white-space:pre-wrap; opacity:0; transition:opacity .2s; pointer-events:none; z-index:10; font-size:13px; }
      #toast.show { opacity:1; }
      #toast.err { border-color:#b91c1c; color:#fca5a5; }
      dialog { background:#1a1a1a; color:#eee; border:1px solid #555; border-radius:12px; max-width:760px; width:90%; }
      dialog::backdrop { background:#0009; }
      dialog pre { max-height:60vh; overflow:auto; font-size:12px; white-space:pre-wrap; }
      #detail { max-width:820px; }
      .dhead { display:flex; gap:14px; align-items:center; margin:16px 0; }
      .dhead img { width:72px; height:72px; border-radius:12px; }
      .dhead h2 { margin:0; }
      .dactions { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
      table.meta { border-collapse:collapse; width:100%; font-size:13px; margin-bottom:14px; }
      table.meta th, table.meta td { text-align:left; padding:5px 10px; border-bottom:1px solid #333; vertical-align:top; }
      table.meta th { width:160px; opacity:.75; font-weight:600; }
      .md { font-size:14px; line-height:1.55; }
      .md img.mdimg { max-width:100%; border-radius:8px; }
      .md pre { background:#111; padding:10px; border-radius:8px; overflow:auto; }
      .md code { background:#1113; padding:1px 4px; border-radius:4px; font-size:12.5px; }
      .md a { color:var(--primary-color,#03a9f4); }
      .md h1,.md h2,.md h3 { margin:14px 0 6px; }
      details.fulldocs { margin-top:10px; }
      details.fulldocs summary { cursor:pointer; color:var(--primary-color,#03a9f4); }
      details.fulldocs .md { margin-top:8px; padding:10px; border:1px solid #333; border-radius:8px; }
      #dback, #dback2 { margin:8px 0; }
      .dlgbtns { display:flex; gap:10px; justify-content:flex-end; margin-top:14px; }
      .warnbox { background:#78350f33; border:1px solid #b45309; border-radius:8px; padding:10px 14px; font-size:13px; }
      .warnbox ul { margin:6px 0 0; padding-left:18px; }
      .notebox { background:#0c4a6e33; border:1px solid #0369a1; border-radius:8px; padding:10px 14px; font-size:13px; margin-top:8px; }
      .notebox ul { margin:6px 0 0; padding-left:18px; }
      .okbox { background:#14532d33; border:1px solid #15803d; border-radius:8px; padding:10px 14px; font-size:13px; }
      .badtext { color:#f87171; font-weight:600; }
      dialog .close { float:right; }
    </style>
    <div class="bar">
      <h1>Apps</h1>
      <input type="search" id="q" placeholder="${this._t("search_placeholder")}">
      <select id="repo">
        <option value="all">${this._t("all_sources")}</option>
        <option value="official">${this._t("official")}</option>
        <option value="community">${this._t("community")}</option>
        <option value="local">${this._t("local")}</option>
      </select>
      <div id="fltwrap">
        <button id="fltbtn">${this._t("filter_btn")} ▾</button>
        <div id="fltmenu" hidden>
          <label><input type="checkbox" value="all" checked> ${this._t("f_all")}</label>
          ${Object.keys(TAG_FILTERS).map((t) =>
            `<label><input type="checkbox" value="${t}"> ${this._t("f_" + t)}</label>`).join("")}
          <div class="flthint">${this._t("filter_hint")}</div>
        </div>
      </div>
      <span id="disk" class="disk"></span>
      <button id="refresh" title="${this._t("refresh_catalog")}" aria-label="${this._t("refresh_catalog")}">⟳</button>
    </div>
    <div id="browser">
      <div id="status"></div>
      <div id="grid"></div>
    </div>
    <div id="detail" style="display:none"></div>
    <div id="toast"></div>
    <dialog id="logdlg"><button class="close" onclick="this.closest('dialog').close()">✕</button><h3></h3><pre></pre></dialog>
    <dialog id="instdlg"><div class="dlgbody"></div>
      <div class="dlgbtns"><button id="dlgcancel">${this._t("cancel")}</button>
      <button id="dlggo" class="primary">${this._t("install")}</button></div></dialog>
    <dialog id="rmdlg"><div class="dlgbody"></div>
      <div class="dlgbtns"><button id="rmcancel">${this._t("cancel")}</button>
      <button id="rmpurge" class="danger">${this._t("remove_purge")}</button>
      <button id="rmkeep" class="primary">${this._t("remove_keep")}</button></div></dialog>`;
    const q = this.shadowRoot.querySelector("#q");
    q.addEventListener("input", (e) => {
      this._filter = e.target.value;
      this._showList();
      this._renderList();
    });
    /* the hass setter can render before the element is attached to the
       document — focus() on a disconnected element silently no-ops, so
       retry from connectedCallback and after the next frame */
    this._focusSearch();
    this.shadowRoot.querySelector("#repo").addEventListener("change", (e) => {
      this._repo = e.target.value;
      this._showList();
      this._renderList();
    });
    const fltwrap = this.shadowRoot.querySelector("#fltwrap");
    const fltmenu = this.shadowRoot.querySelector("#fltmenu");
    this.shadowRoot.querySelector("#fltbtn").addEventListener("click", () => {
      fltmenu.hidden = !fltmenu.hidden;
    });
    /* composedPath sees through shadow boundaries/retargeting; the
       document listener also catches clicks on the HA chrome outside
       this custom element. _docClickBound guards double-binding. */
    if (!this._docClickBound) {
      this._docClickBound = true;
      document.addEventListener("click", (e) => {
        if (!e.composedPath().includes(fltwrap)) fltmenu.hidden = true;
      });
    }
    /* "change" (not "click"): canceling click reverts the native
       checked state after the handler — _tags is the source of truth,
       the DOM is re-synced from it */
    fltmenu.addEventListener("change", (e) => {
      const cb = e.target.closest('input[type=checkbox]');
      if (!cb) return;
      if (cb.value === "all") {
        this._tags.clear();
      } else {
        const cur = this._tags.get(cb.value) || 0;
        const next = cur === 0 ? 1 : cur === 1 ? -1 : 0;
        next === 0 ? this._tags.delete(cb.value) : this._tags.set(cb.value, next);
      }
      this._saveTags();
      this._syncFilterMenu();
      this._showList();
      this._renderList();
    });
    this._syncFilterMenu();
    this.shadowRoot
      .querySelector("#refresh")
      .addEventListener("click", () => this._refreshCatalog());
  }
}

if (!customElements.get("ha-apps-panel"))
  customElements.define("ha-apps-panel", HaAppsPanel);
