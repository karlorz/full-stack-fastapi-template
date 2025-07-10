{{/*
Cloudflare API Token Secret Name
This is used to store the Cloudflare API token for cert-manager.
*/}}
{{- define "cert-manager.cloudflare.secret-name" -}}
{{ default "cloudflare-api-token-secret" .Values.externalSecrets.cloudflare.secretName }}
{{- end }}

{{/*
Cloudflare API Token Secret Name
This is used to store the Cloudflare API token for cert-manager.
*/}}
{{- define "cert-manager.cloudflare.secret-key" -}}
{{ default "api-token" .Values.externalSecrets.cloudflare.secretKey }}
{{- end }}
