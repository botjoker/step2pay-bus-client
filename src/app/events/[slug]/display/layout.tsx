export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Убираем шапку/футер клиентского сайта для fullscreen-дисплея
  return <>{children}</>;
}
