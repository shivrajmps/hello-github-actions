#!/usr/bin/env bash
# Whisper (sherpa-onnx) + Silero VAD from GitHub releases (huggingface.co is blocked in cloud sessions). Usage: get_models.sh modeldir
set -e; M="$1"; mkdir -p "$M"; cd "$M"
[ -d sherpa-onnx-whisper-turbo ] || { curl -sS -L -o turbo.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2 && tar xjf turbo.tar.bz2 && rm turbo.tar.bz2; }
[ -f silero_vad.onnx ] || curl -sS -L -o silero_vad.onnx https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx
python3 -m venv venv && ./venv/bin/pip -q install sherpa-onnx numpy soundfile pillow && echo "models + venv ready in $M"
