{{- define "fastapicloud.external-secret.secretstore.ref.name" -}}
{{ $name := default "parameter-store" .Values.global.externalSecrets.name }}
{{- default $name .Values.externalSecrets.name }}
{{- end -}}

{{- define "fastapicloud.external-secret.secretstore.ref.kind" -}}
{{ $kind := default "SecretStore" .Values.global.externalSecrets.kind }}
{{- default $kind .Values.externalSecrets.kind }}
{{- end -}}

{{/*
Generate a ExternalSecret resource.

Expects a list with:
- key of the application (example: "api")
- context (example: .)
*/}}
{{- define "fastapicloud.resource.external-secret" -}}
{{- $key := index . 0 }}
{{- $ctx := index . 1 }}
{{- $app := index $ctx.Values $key }}
{{- $app = set $app "name" $key }}
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
{{- $appCtx = set $appCtx "App" $app }}
{{- $appExternalSecrets := default (dict) $app.externalSecrets }}
{{- $secretData := default (dict) (merge (default (dict) $appExternalSecrets.secrets) (default (dict) $appCtx.Values.global.externalSecrets.secrets)) }}
{{- if (or (default false $appExternalSecrets.enabled) (default false $appCtx.Values.global.externalSecrets.enabled)) }}
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: {{ include "fastapicloud.fullname" $appCtx }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
spec:
  data:
    {{- range $secretKey, $secret := $secretData }}
    - secretKey: {{ $secretKey }}
      remoteRef:
        {{- with $secret.remoteRef }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
    {{- end }}
  secretStoreRef:
    name: {{ include "fastapicloud.external-secret.secretstore.ref.name" $appCtx }}
    kind: {{ include "fastapicloud.external-secret.secretstore.ref.kind" $appCtx }}
{{- end }}
{{- end -}}
