import Icon from '../../components/Icon';
import LessonText from '../../components/LessonText';

/** The friendly red "that didn't pass" banner. Shared by the lesson panel
 *  (wide layout) and the floating Code-tab error (phones); callers pass extra
 *  classes for positioning. */
export default function FailMessage({ text, className = '' }: { text: string; className?: string }) {
  return (
    <p role="alert" className={`rounded-md border-2 border-red-400 bg-red-50 p-2 font-body font-bold text-red-700 ${className}`}><Icon name="red-tile" /> <span><LessonText text={text} /></span></p>
  );
}
