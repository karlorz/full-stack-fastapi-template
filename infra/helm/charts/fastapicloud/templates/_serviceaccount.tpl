{{/*
Generate a ServiceAccount resource.

Expects a list with:
- key of the application (example: "api")
- context (example: .)
*/}}
{{- define "fastapicloud.resource.serviceaccount" -}}
{{- $key := index . 0 }}
{{- $ctx := index . 1 }}
{{- $app := index $ctx.Values $key }}
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ printf "%s-%s" (include "fastapicloud.fullname" $appCtx) $key }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
    {{- with $app.serviceAccount.labels }}
    {{- toYaml . | nindent 4 }}
    {{- end }}
  {{- with $app.serviceAccount.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end -}}
