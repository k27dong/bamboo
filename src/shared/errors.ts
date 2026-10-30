export enum ErrorKind {
  NotInVoice = "not_in_voice",
  OtherVoiceChannel = "other_voice_channel",
  NoConnectPermission = "no_connect_permission",
  NoSpeakPermission = "no_speak_permission",
  NoSession = "no_session",
  NothingPlaying = "nothing_playing",
  NotFound = "not_found",
  SourceDown = "source_down",
  Unplayable = "unplayable",
}

export const ERROR_TEXT: Record<ErrorKind, string> = {
  [ErrorKind.NotInVoice]: "You need to be in a voice channel.",
  [ErrorKind.OtherVoiceChannel]: "I am already in a different voice channel.",
  [ErrorKind.NoConnectPermission]:
    "I don't have permission to join your voice channel.",
  [ErrorKind.NoSpeakPermission]:
    "I don't have permission to speak in your voice channel.",
  [ErrorKind.NoSession]: "This server does not have an active player session.",
  [ErrorKind.NothingPlaying]: "There is no track playing.",
  [ErrorKind.NotFound]: "No results found.",
  [ErrorKind.SourceDown]:
    "NetEase isn't answering right now. Try again in a moment.",
  [ErrorKind.Unplayable]: "NetEase gave no link for this song.",
}

export const UNEXPECTED_ERROR_TEXT = "Something went wrong."

export class BambooError extends Error {
  constructor(readonly kind: ErrorKind) {
    super(ERROR_TEXT[kind])
  }
}
