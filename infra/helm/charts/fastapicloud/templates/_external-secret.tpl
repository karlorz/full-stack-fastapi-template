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
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: {{ printf "%s-%s" (include "fastapicloud.fullname" $ctx) $key }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
spec:
  data:
    {{- range (default (list) $app.externalSecrets) }}
    - secretKey: {{ .secretKey }}
      remoteRef:
        metadataPolicy: Fetch
        {{- with .remoteRef }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
    {{- end }}
{{- end -}}
