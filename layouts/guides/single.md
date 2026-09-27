{{- if .Params.tool_guides_index -}}
# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
- URL: {{ .Permalink }}
- Topic guides: {{ "guides/" | absURL }}

{{- $pages := site.RegularPages -}}
{{- range site.Data.tools }}

## {{ .name }}

{{- range .tools }}
{{- $slug := .slug -}}
{{- with where $pages "Params.tool_guide_slug" $slug }}
{{- range . }}
- [{{ .Title }}]({{ .Permalink }}) — {{ .Description }}
{{- end }}
{{- end }}
{{- end }}
{{- end -}}
{{- else -}}
{{- with .Params.tool_guide_slug -}}
{{- $slug := . -}}
{{- $tool := dict -}}
{{- range partial "tools/registry.html" $ -}}
  {{- if eq .id $slug }}{{ $tool = . }}{{ end -}}
{{- end -}}
{{- $guide := partial "tools/guide.html" $slug -}}
# {{ $.Title }}

{{ with $.Description }}{{ . }}

{{ end -}}
- Tool: {{ printf "%stools/%s/" site.BaseURL $slug }}
- Guide URL: {{ $.Permalink }}
- Tool guides index: {{ "guides/tools/" | absURL }}
{{- with $.Params.broader_guide }}
- Broader guide: {{ .title }} ({{ .url | absURL }})
{{- end }}

## What it does

{{ with $guide.about }}{{ . }}{{ else }}{{ $tool.description }}{{ end }}

## Use the tool

Open {{ printf "%stools/%s/" site.BaseURL $slug }}, add the input the tool asks for, run it, and check the output before using it elsewhere.

## Input and output

- Input: {{ with $tool.input.format }}{{ . }} {{ end }}{{ $tool.input.type | default "text" }}.
- Output: {{ with $tool.output.format }}{{ . }} {{ end }}{{ $tool.output.type | default "text" }}.
- Category: {{ $tool.category_name }}.

## Privacy and processing

{{- if eq $tool.privacy.processing "client-side" }}
Processing happens locally in your browser. This tool does not upload the input to ilham.dev.
{{- else if eq $tool.privacy.processing "third-party-api" }}
This tool needs a network request to complete the lookup or test. Send only data you are comfortable sharing with the target service.
{{- else }}
Processing model: {{ $tool.privacy.processing }}.
{{- end }}

{{- with $tool.use_cases }}

## Common use cases

{{- range . }}
- {{ . }}
{{- end }}
{{- end }}

{{- with $tool.limitations }}

## Limitations

{{- range . }}
- {{ . }}
{{- end }}
{{- end }}

{{- with $guide.faq }}

## Questions

{{- range . }}

### {{ .q }}

{{ .a }}
{{- end }}
{{- end -}}
{{- else -}}
# {{ $.Title }}

{{ $.RawContent }}
{{- end -}}
{{- end -}}
