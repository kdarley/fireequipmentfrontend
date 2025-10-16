import Image from 'next/image';

export default function DarleyLogo() {
    return (
        <Image
            // src="https://images.darleyx.com/darley-logo-white.svg"
            src="/darley-logo-white.svg"

            width={217}
            height={45}
            alt="Darley Logo"
        />
    );
}