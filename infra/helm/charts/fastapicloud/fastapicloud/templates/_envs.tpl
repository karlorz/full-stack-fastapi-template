{{- define "fastapicloud.envs" -}}
envs:
    BUILDER_API_URL: {{ include "fastapicloud.env.builder.url" . }}
{{- end -}}

{{- define "fastapicloud.env.builder.url" -}}
{{- $builderCtx := merge (dict "App" (dict "name" "builder")) . -}}
http://{{ include "fastapicloud.fullname" $builderCtx }}.{{ .Release.Namespace }}.svc.{{ default "cluster.local" .Values.kubernetesClusterDomain }}
{{- end -}}
