{{/*
Synadia Credentials Secret Name
This is used to store the synadia credentials for vector.
*/}}
{{- define "vector.synadia.secret-name" -}}
{{ default "synadia-credentials-secret" .Values.externalSecrets.synadia.secretName }}
{{- end }}

{{/*
Synadia Credentials Secret Key
This is used to store the synadia credentials for vector.
*/}}
{{- define "vector.synadia.secret-key" -}}
{{ default "nats.creds" .Values.externalSecrets.synadia.secretKey }}
{{- end }}
