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
    "loading_details": "Loading details …",
    "details_failed": "Details could not be loaded: {msg}",
    "back": "Back",
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
    "readme": "README",
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
    "disk_line": "Disk: {free} MB free / {total} MB",
    "disk_low_title": "Below {min} MB free — installations are blocked",
    "count_line": "{shown} of {total} add-ons",
    "update_badge": "update available",
    "sup_badge_title": "Uses Supervisor APIs ({keys}) — may be limited",
    "verified_badge": "verified",
    "verified_title": "Tested with auto-setup — will be fully configured",
    "disk_low_btn": "Not enough free disk space",
    "details_btn": "Details →",
    "search_placeholder": "Search add-ons …",
    "all_sources": "All sources",
    "official": "Official",
    "community": "Community",
    "refresh_catalog": "Refresh catalog",
    "cancel": "Cancel",
    "port_btn": "Port {port}",
    "busy": "…",
    "count_installed": "({installed} installed)",
    "f_all": "all",
    "f_installable": "installable",
    "f_installed": "installed",
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
    "loading_details": "Lade Details …",
    "details_failed": "Details konnten nicht geladen werden: {msg}",
    "back": "Zurück",
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
    "readme": "README",
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
    "disk_line": "Disk: {free} MB frei / {total} MB",
    "disk_low_title": "Unter {min} MB frei — Installationen werden blockiert",
    "count_line": "{shown} von {total} Add-ons",
    "update_badge": "update verfügbar",
    "sup_badge_title": "Nutzt Supervisor-APIs ({keys}) — evtl. eingeschränkt",
    "verified_badge": "getestet",
    "verified_title": "Mit Auto-Setup getestet — wird vollständig eingerichtet",
    "disk_low_btn": "Zu wenig freier Speicher",
    "details_btn": "Details →",
    "search_placeholder": "Add-ons durchsuchen …",
    "all_sources": "Alle Quellen",
    "official": "Offiziell",
    "community": "Community",
    "refresh_catalog": "Katalog aktualisieren",
    "cancel": "Abbrechen",
    "port_btn": "Port {port}",
    "busy": "…",
    "count_installed": "({installed} installiert)",
    "f_all": "alle",
    "f_installable": "installierbar",
    "f_installed": "installiert",
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


class HaAppsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._addons = [];
    this._filter = "";
    this._repo = "all";
    this._stateFilter = "all";
    this._busy = new Set();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._rendered = true;
      this._render();
      this._load();
    }
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
    this._setStatus(this._t("loading_catalog"));
    try {
      this._status = await this._api("GET", "status").catch(() => null);
      this._renderDisk();
      this._addons = await this._api("GET", "addons");
      if (this._addons.length === 0) {
        this._setStatus(
          this._t("catalog_empty")
        );
        return;
      }
      this._renderList();
    } catch (_err) {
      this._setStatus(this._t("catalog_failed"));
    }
  }

  async _refreshCatalog() {
    this._setStatus(this._t("refreshing"));
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
          a.post_install.map((n) => `<li>${n}</li>`).join("") +
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
    }
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
    this.shadowRoot.querySelector("#browser").style.display = this._t("none");
    detail.innerHTML = "<p>" + this._t("loading_details") + "</p>";
    try {
      const repo = this._addons.find((x) => x.slug === slug)?.repo || "";
      const [info, readme] = await Promise.all([
        this._api("GET", `addon/${slug}`),
        this._api("GET", `readme/${repo}/${slug}`)
          .catch(() => ({ markdown: "" })),
      ]);
      this._renderDetail(detail, info, readme.markdown || "");
    } catch (err) {
      const msg = err?.error || err?.message || JSON.stringify(err);
      console.error("[APPS] detail load failed:", slug, err);
      detail.innerHTML =
        `<p>${this._t("details_failed", {msg})}</p>` +
        `<button id="dback">${this._t("back")}</button>`;
    }
    detail.querySelector("#dback")?.addEventListener("click", () =>
      this._showList()
    );
  }

  _showList() {
    this.shadowRoot.querySelector("#detail").style.display = this._t("none");
    this.shadowRoot.querySelector("#browser").style.display = "block";
  }

  _renderDetail(detail, a, markdown) {
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
          a.post_install.map((n) => `<li>${n}</li>`).join("") +
          `</ul></div>`
        : ""}
      ${portRows.length ? `<h3>${this._t("ports")}</h3><table class="meta"><tr><th>${this._t("container")}</th><th>${this._t("host")}</th><th>${this._t("description")}</th></tr>${portRows.join("")}</table>` : ""}
      ${optRows.length ? `<h3>${this._t("options_defaults")}</h3><table class="meta">${optRows.join("")}</table>` : ""}
      ${markdown ? `<h3>${this._t("readme")}</h3><div class="md">${this._md(markdown, a.repo, a.slug)}</div>` : ""}
      <button id="dback2">${this._t("back_to_store")}</button>`;
    detail.querySelectorAll("#dback,#dback2").forEach((b) =>
      b.addEventListener("click", () => this._showList())
    );
    detail.querySelectorAll("button[data-act],button[data-port]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (btn.dataset.port) {
          window.open(
            `${location.protocol}//${location.hostname}:${btn.dataset.port}/`,
            "_blank"
          );
          return;
        }
        const act = btn.dataset.act;
        if (act === "open") {
          window.open(
            `${location.protocol}//${location.hostname}:${a.webui_port}/`,
            "_blank"
          );
        } else if (act === "logs") {
          this._showLogs(a.slug);
        } else if (act === "install") {
          this._confirmInstall(a);
        } else if (act === "remove") {
          await this._confirmRemove(a);
        } else {
          await this._action(a.slug, act);
        }
        if (act !== "open" && act !== "logs" && act !== "install") {
          const addons = await this._api("GET", "addons");
          this._addons = addons;
          const fresh = addons.find((x) => x.slug === a.slug);
          if (fresh) this._renderDetail(detail, Object.assign({}, a, fresh));
        }
      });
    });
  }

  _actionButtons(a) {
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
          buttons.push(`<button class="primary" data-act="open">${this._t("open_web_ui")}</button>`);
        for (const p of a.extra_ports || [])
          buttons.push(`<button data-port="${p}">${this._t("port_btn", {port: p})}</button>`);
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
    el.textContent = this._t("disk_line", {free: s.disk_free_mb, total: s.disk_total_mb});
    el.className = low ? "disk low" : "disk";
    el.title = low
      ? this._t("disk_low_title", {min: s.min_free_mb})
      : "";
    this._diskLow = low;
  }

  _setStatus(msg) {
    this.shadowRoot.querySelector("#status").textContent = msg;
    this.shadowRoot.querySelector("#grid").innerHTML = "";
  }

  _filtered() {
    const q = this._filter.toLowerCase();
    return this._addons
      .filter(
        (a) =>
          (this._repo === "all" || a.repo === this._repo) &&
          (this._stateFilter === "all" ||
            (this._stateFilter === "installable" && a.supported) ||
            (this._stateFilter === "installed" && a.installed)) &&
          (!q ||
            a.name.toLowerCase().includes(q) ||
            a.slug.includes(q) ||
            (a.description || "").toLowerCase().includes(q))
      )
      .sort((a, b) => b.installed - a.installed || a.name.localeCompare(b.name));
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
      this._stateFilter = "installed";
      this.shadowRoot.querySelector("#stateflt").value = "installed";
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
    if (busy) {
      buttons.push("<button disabled>…</button>");
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
      if (a.state === "running") {
        buttons.push(`<button data-act="stop">${this._t("stop")}</button>`);
        if (a.webui_port)
          buttons.push(
            `<button class="primary" data-act="open">${this._t("open_web_ui")}</button>`
          );
        for (const p of a.extra_ports || [])
          buttons.push(`<button data-port="${p}">${this._t("port_btn", {port: p})}</button>`);
      } else {
        buttons.push(`<button class="primary" data-act="start">${this._t("start")}</button>`);
      }
      if (a.update_available)
        buttons.push(`<button data-act="update">${this._t("update_action")}</button>`);
      buttons.push(`<button data-act="logs">${this._t("logs")}</button>`);
      buttons.push(`<button class="danger" data-act="remove">${this._t("remove")}</button>`);
    }

    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
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

    card.querySelectorAll("button[data-act],button[data-port],button[data-detail]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.detail) {
          this._openDetail(btn.dataset.detail);
          return;
        }
        if (btn.dataset.port) {
          window.open(
            `${location.protocol}//${location.hostname}:${btn.dataset.port}/`,
            "_blank"
          );
          return;
        }
        const act = btn.dataset.act;
        if (act === "open") {
          window.open(
            `${location.protocol}//${location.hostname}:${a.webui_port}/`,
            "_blank"
          );
        } else if (act === "logs") {
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
      button { padding:7px 14px; border-radius:8px; border:1px solid #555; background:transparent; color:inherit; cursor:pointer; font-size:13px; }
      button:hover:not(:disabled) { background:#ffffff18; }
      button.primary { background:var(--primary-color,#03a9f4); border-color:transparent; color:#fff; }
      button.danger { color:#f87171; border-color:#7f1d1d; }
      button:disabled { opacity:.5; cursor:default; }
      #status { font-size:13px; opacity:.7; margin-bottom:10px; }
      #status a { color:var(--primary-color,#03a9f4); }
      .disk { font-size:12px; opacity:.8; padding:6px 10px; border-radius:8px; background:#333; }
      .disk.low { background:#b91c1c; color:#fff; opacity:1; }
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
      <select id="stateflt">
        <option value="all">${this._t("f_all")}</option>
        <option value="installable">${this._t("f_installable")}</option>
        <option value="installed">${this._t("f_installed")}</option>
      </select>
      <span id="disk" class="disk"></span>
      <button id="refresh">${this._t("refresh_catalog")}</button>
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
    this.shadowRoot.querySelector("#q").addEventListener("input", (e) => {
      this._filter = e.target.value;
      this._showList();
      this._renderList();
    });
    this.shadowRoot.querySelector("#repo").addEventListener("change", (e) => {
      this._repo = e.target.value;
      this._showList();
      this._renderList();
    });
    this.shadowRoot.querySelector("#stateflt").addEventListener("change", (e) => {
      this._stateFilter = e.target.value;
      this._showList();
      this._renderList();
    });
    this.shadowRoot
      .querySelector("#refresh")
      .addEventListener("click", () => this._refreshCatalog());
  }
}

if (!customElements.get("ha-apps-panel"))
  customElements.define("ha-apps-panel", HaAppsPanel);
