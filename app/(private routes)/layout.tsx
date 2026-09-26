interface PrivateLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function PrivateLayout({ children, modal }: Readonly<PrivateLayoutProps>) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
