import Add from '@material-symbols/svg-400/outlined/add.svg?react'
import Archive from '@material-symbols/svg-400/outlined/archive.svg?react'
import Bolt from '@material-symbols/svg-400/outlined/bolt.svg?react'
import CheckCircle from '@material-symbols/svg-400/outlined/check_circle.svg?react'
import Close from '@material-symbols/svg-400/outlined/close.svg?react'
import Cloud from '@material-symbols/svg-400/outlined/cloud.svg?react'
import DarkMode from '@material-symbols/svg-400/outlined/dark_mode.svg?react'
import Dashboard from '@material-symbols/svg-400/outlined/dashboard.svg?react'
import Delete from '@material-symbols/svg-400/outlined/delete.svg?react'
import DeleteForever from '@material-symbols/svg-400/outlined/delete_forever.svg?react'
import Description from '@material-symbols/svg-400/outlined/description.svg?react'
import Draw from '@material-symbols/svg-400/outlined/draw.svg?react'
import Edit from '@material-symbols/svg-400/outlined/edit.svg?react'
import FormatBold from '@material-symbols/svg-400/outlined/format_bold.svg?react'
import FormatItalic from '@material-symbols/svg-400/outlined/format_italic.svg?react'
import FormatListBulleted from '@material-symbols/svg-400/outlined/format_list_bulleted.svg?react'
import FormatListNumbered from '@material-symbols/svg-400/outlined/format_list_numbered.svg?react'
import FormatStrikethrough from '@material-symbols/svg-400/outlined/format_strikethrough.svg?react'
import FormatUnderlined from '@material-symbols/svg-400/outlined/format_underlined.svg?react'
import Keep from '@material-symbols/svg-400/outlined/keep.svg?react'
import KeepFill from '@material-symbols/svg-400/outlined/keep-fill.svg?react'
import KeepOff from '@material-symbols/svg-400/outlined/keep_off.svg?react'
import LightMode from '@material-symbols/svg-400/outlined/light_mode.svg?react'
import Link from '@material-symbols/svg-400/outlined/link.svg?react'
import Lock from '@material-symbols/svg-400/outlined/lock.svg?react'
import Logout from '@material-symbols/svg-400/outlined/logout.svg?react'
import Menu from '@material-symbols/svg-400/outlined/menu.svg?react'
import MoreHoriz from '@material-symbols/svg-400/outlined/more_horiz.svg?react'
import ProgressActivity from '@material-symbols/svg-400/outlined/progress_activity.svg?react'
import Redo from '@material-symbols/svg-400/outlined/redo.svg?react'
import RestoreFromTrash from '@material-symbols/svg-400/outlined/restore_from_trash.svg?react'
import Search from '@material-symbols/svg-400/outlined/search.svg?react'
import Settings from '@material-symbols/svg-400/outlined/settings.svg?react'
import Star from '@material-symbols/svg-400/outlined/star.svg?react'
import StarFill from '@material-symbols/svg-400/outlined/star-fill.svg?react'
import Undo from '@material-symbols/svg-400/outlined/undo.svg?react'
import Warning from '@material-symbols/svg-400/outlined/warning.svg?react'
import { cn } from '../../lib/cn'

const ICONS = {
  add: Add,
  archive: Archive,
  bolt: Bolt,
  check_circle: CheckCircle,
  close: Close,
  cloud: Cloud,
  dark_mode: DarkMode,
  dashboard: Dashboard,
  delete: Delete,
  delete_forever: DeleteForever,
  description: Description,
  draw: Draw,
  edit: Edit,
  format_bold: FormatBold,
  format_italic: FormatItalic,
  format_list_bulleted: FormatListBulleted,
  format_list_numbered: FormatListNumbered,
  format_strikethrough: FormatStrikethrough,
  format_underlined: FormatUnderlined,
  light_mode: LightMode,
  link: Link,
  lock: Lock,
  logout: Logout,
  menu: Menu,
  more_horiz: MoreHoriz,
  pin: Keep,
  pin_filled: KeepFill,
  unpin: KeepOff,
  redo: Redo,
  restore: RestoreFromTrash,
  spinner: ProgressActivity,
  search: Search,
  settings: Settings,
  star: Star,
  star_filled: StarFill,
  undo: Undo,
  warning: Warning,
} as const

export type IconName = keyof typeof ICONS

const SIZES = {
  sm: 'text-[18px]',
  md: 'text-[24px]',
  lg: 'text-[32px]',
  xl: 'text-[64px]',
} as const

export type IconSize = keyof typeof SIZES

interface IconProps {
  name: IconName
  size?: IconSize
  className?: string
}

export function Icon({ name, size = 'md', className }: IconProps) {
  const Glyph = ICONS[name]
  return <Glyph aria-hidden="true" className={cn('shrink-0', SIZES[size], className)} />
}
