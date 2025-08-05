{{/*
Generate a knative Service resource.

Expects a list with:
- key of the application (example: "api")
- context (example: .)
*/}}
{{- define "fastapicloud.resource.knative-service" -}}
{{- $key := index . 0 }}
{{- $ctx := index . 1 }}
{{- $app := index $ctx.Values $key }}
{{- $app = set $app "name" $key }}
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
{{- $appCtx = set $appCtx "App" $app }}
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: {{ include "fastapicloud.fullname" $appCtx }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
    networking.knative.dev/visibility: {{ $appCtx.Values.kubernetesClusterDomain | replace "." "-" }}
  {{- with $app.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: {{ default 1 $app.autoscaling.minScale | quote }}
        {{- with $app.autoscaling.maxScale }}
        autoscaling.knative.dev/maxScale: {{ . | quote }}
        {{- end }}
      labels:
        {{- include "fastapicloud.selectorLabels" $appCtx | nindent 8 }}
    spec:
      containerConcurrency: {{ $app.containerConcurrency }}
      containers:
      - name: {{ include "fastapicloud.fullname" $appCtx }}
        image: "{{ $app.image.repository }}:{{ $app.image.tag | default $appCtx.Chart.AppVersion }}"
        imagePullPolicy: {{ $app.image.pullPolicy }}
        {{- $computedEnvs := (include "fastapicloud.envs" $appCtx | fromYaml).envs }}
        {{- $envs := merge $computedEnvs (default (dict) $app.environment) (default (dict) $appCtx.Values.global.environment) }}
        {{- if gt (len $envs) 0 }}
        env:
        {{- range $key, $value := $envs }}
        - name: {{ $key }}
          value: {{ $value | quote }}
        {{- end }}
        {{- end }}
        {{- $appExternalSecrets := default (dict) $app.externalSecrets }}
        {{- if (or (default false $appExternalSecrets.enabled) (default false $appCtx.Values.global.externalSecrets.enabled)) }}
        envFrom:
        - secretRef:
            name: {{ include "fastapicloud.fullname" $appCtx }}
        {{- end }}
        readinessProbe:
          successThreshold: 1
          tcpSocket:
            port: 0
        {{- with $app.resources }}
        resources:
          {{- toYaml . | nindent 10 }}
        {{- end }}
        {{- with $app.securityContext }}
        securityContext:
          {{- toYaml . | nindent 10 }}
        {{- end }}
      enableServiceLinks: false
      serviceAccountName: {{ include "fastapicloud.serviceAccountName" $appCtx }}
      timeoutSeconds: {{ $app.timeoutSeconds }}
  traffic:
  - latestRevision: true
    percent: 100
{{- end -}}
