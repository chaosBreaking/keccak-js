'use strict'
/*
	HMAC(K, M) = H( (K' ^ opad) || H((K' ^ ipad) || m ) )
	H为密码散列函数（如MD5或SHA-1）
	K为密钥（secret key）
	m是要认证的消息
	K'是从原始密钥K导出的另一个秘密密钥（如果K短于散列函数的输入块大小，则向右填充（Padding）零；如果比该块大小更长，则对K进行散列）
	|| 代表串接
	⊕ 代表异或（XOR）
	opad 是外部填充（0x5c5c5c…5c5c，一段十六进制常量）
	ipad 是内部填充（0x363636…3636，一段十六进制常量）
*/
