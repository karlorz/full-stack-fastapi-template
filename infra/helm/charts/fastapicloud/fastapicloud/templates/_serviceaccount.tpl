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
{{- $app = set $app "name" $key }}
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
{{- $appCtx = set $appCtx "App" $app }}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "fastapicloud.serviceAccountName" $appCtx }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
    {{- with $appCtx.Values.serviceAccount.labels }}
    {{- toYaml . | nindent 4 }}
    {{- end }}
  {{- with $appCtx.Values.serviceAccount.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end -}}
