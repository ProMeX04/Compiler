"use client";
export interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
}

export interface PistonExecuteRequest {
  language: string;
  version: string;
  files: {
    content: string;
  }[];
  stdin: string;
}

export interface PistonExecuteResponse {
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
  language: string;
  version: string;
}
