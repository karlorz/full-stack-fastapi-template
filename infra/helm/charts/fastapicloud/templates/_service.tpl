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
{{- $appCtx := $ctx }}
{{- $appCtx = set $appCtx "Values" (merge $ctx.Values $app) }}
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: {{ printf "%s-%s" (include "fastapicloud.fullname" $appCtx) $key }}
  labels:
    {{- include "fastapicloud.labels" $appCtx | nindent 4 }}
    networking.knative.dev/visibility: {{ $ctx.Values.kubernetesClusterDomain | replace "." "-" }}
  {{- with $app.serviceAccount.annotations }}
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
      - name: {{ $ctx.Chart.Name }}-{{ $key }}
        image: "{{ $app.image.repository }}:{{ $app.image.tag }}"
        imagePullPolicy: {{ $app.image.pullPolicy }}
        {{- with $app.environment }}
        env:
        {{- range $key, $value := . }}
        - name: {{ $key }}
          value: {{ $value | quote }}
        {{- end }}
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
      serviceAccountName: {{ include "fastapicloud.serviceAccountName" $ctx }}
      timeoutSeconds: {{ $app.timeoutSeconds }}
  traffic:
  - latestRevision: true
    percent: 100
{{- end -}}
