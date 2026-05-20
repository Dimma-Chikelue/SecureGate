import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";

interface Props {
  url: string;
}

export default function VerificationEmail({ url }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>SecureGate</Text>
          <Text style={subtitle}>Verify your email address</Text>
          <Section>
            <Text style={paragraph}>
              Click the link below to verify your email address and activate
              your account.
            </Text>
            <Link href={url} style={button}>
              Verify Email
            </Link>
            <Text style={paragraph}>
              If the button above doesn&apos;t work, copy and paste this URL:
            </Text>
            <Text style={urlStyle}>{url}</Text>
            <Text style={paragraph}>
              This link expires in 15 minutes.
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you did not create an account, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#0a0a0a",
  fontFamily: "Mulish, -apple-system, sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#111111",
  border: "1px solid #1f1f1f",
  borderRadius: "12px",
  padding: "40px 32px",
  maxWidth: "480px",
  margin: "0 auto",
};

const heading = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#ffffff",
  margin: "0 0 4px",
  letterSpacing: "-0.02em",
};

const subtitle = {
  fontSize: "14px",
  color: "#888888",
  margin: "0 0 24px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#a0a0a0",
  margin: "0 0 16px",
};

const button = {
  display: "inline-block",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  margin: "8px 0 24px",
};

const urlStyle = {
  fontSize: "12px",
  color: "#666666",
  wordBreak: "break-all" as const,
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#1f1f1f",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#555555",
  margin: "0",
};
