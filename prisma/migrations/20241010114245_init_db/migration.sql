BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[parameters] (
    [id] INT NOT NULL IDENTITY(1,1),
    [company] VARCHAR(50) NOT NULL,
    [address] VARCHAR(100) NOT NULL,
    [phone] VARCHAR(30) NOT NULL,
    [email] VARCHAR(50) NOT NULL,
    [fixedRate] DECIMAL(5,2) NOT NULL,
    [decliningRate] DECIMAL(5,2) NOT NULL,
    [adminFee] DECIMAL(5,2) NOT NULL CONSTRAINT [parameters_adminFee_df] DEFAULT 1,
    CONSTRAINT [parameters_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [username] VARCHAR(50) NOT NULL,
    [memberId] VARCHAR(50) NOT NULL,
    [NIK] VARCHAR(30) NOT NULL,
    [email] VARCHAR(60),
    [password] VARCHAR(100) NOT NULL,
    [phone] VARCHAR(30) NOT NULL,
    [name] VARCHAR(100),
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([username]),
    CONSTRAINT [users_memberId_key] UNIQUE NONCLUSTERED ([memberId]),
    CONSTRAINT [users_NIK_key] UNIQUE NONCLUSTERED ([NIK])
);

-- CreateTable
CREATE TABLE [dbo].[sessions] (
    [id] VARCHAR(50) NOT NULL,
    [valid] BIT NOT NULL CONSTRAINT [sessions_valid_df] DEFAULT 1,
    [userAgent] VARCHAR(100) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [sessions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [username] VARCHAR(50) NOT NULL,
    CONSTRAINT [sessions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[anggota] (
    [noAnggota] VARCHAR(50) NOT NULL,
    [nip] VARCHAR(15) NOT NULL,
    [NIK] VARCHAR(30) NOT NULL,
    [namaunit] VARCHAR(50) NOT NULL,
    [namasub] VARCHAR(50) NOT NULL,
    [keterangan] VARCHAR(50),
    [namaAnggota] VARCHAR(50) NOT NULL,
    [alamat] VARCHAR(100) NOT NULL,
    [telp] VARCHAR(15),
    [kelamin] VARCHAR(1) NOT NULL,
    [kodebank] VARCHAR(5),
    [cabang] VARCHAR(100),
    [norek] VARCHAR(50),
    [namarek] VARCHAR(100),
    [saldoVoucher] DECIMAL(16,2) NOT NULL,
    CONSTRAINT [anggota_pkey] PRIMARY KEY CLUSTERED ([noAnggota])
);

-- CreateTable
CREATE TABLE [dbo].[pinjaman] (
    [refCode] UNIQUEIDENTIFIER NOT NULL,
    [noAnggota] VARCHAR(50) NOT NULL,
    [tglPinjam] DATE NOT NULL,
    [isPinjamanUang] BIT NOT NULL CONSTRAINT [pinjaman_isPinjamanUang_df] DEFAULT 1,
    [bulan] SMALLINT NOT NULL,
    [tahun] SMALLINT NOT NULL,
    [nilaiPinjaman] DECIMAL(16,2) NOT NULL,
    [jangkaWaktu] SMALLINT NOT NULL,
    [jenisBunga] VARCHAR(7) NOT NULL,
    [persenBunga] DECIMAL(6,2) NOT NULL,
    [biayaAdmin] DECIMAL(16,2) NOT NULL,
    [tanggalLunas] DATE,
    [lunas] VARCHAR(1) NOT NULL,
    [verificationStatus] VARCHAR(20) NOT NULL CONSTRAINT [pinjaman_verificationStatus_df] DEFAULT 'APPROVED',
    CONSTRAINT [pinjaman_pkey] PRIMARY KEY CLUSTERED ([refCode]),
    CONSTRAINT [pinjaman_refCode_key] UNIQUE NONCLUSTERED ([refCode])
);

-- CreateTable
CREATE TABLE [dbo].[rincian_pinjaman] (
    [refCode] UNIQUEIDENTIFIER NOT NULL,
    [angKe] SMALLINT NOT NULL,
    [bulan] SMALLINT NOT NULL,
    [tahun] SMALLINT NOT NULL,
    [rpPinjaman] DECIMAL(16,2) NOT NULL,
    [rpBunga] DECIMAL(16,2) NOT NULL,
    [rpBayar] DECIMAL(16,2) NOT NULL,
    [blnLunas] SMALLINT,
    [thnLunas] SMALLINT,
    [tglLunas] DATE,
    [lunas] VARCHAR(1) NOT NULL,
    [keterangan] VARCHAR(50),
    CONSTRAINT [rincian_pinjaman_refCode_angKe_key] UNIQUE NONCLUSTERED ([refCode],[angKe])
);

-- CreateTable
CREATE TABLE [dbo].[simpanan] (
    [noAnggota] VARCHAR(50) NOT NULL,
    [namaAnggota] VARCHAR(50),
    [totalPokok] DECIMAL(16,2) NOT NULL,
    [totalWajib] DECIMAL(16,2) NOT NULL,
    [sisaSukarela] DECIMAL(16,2) NOT NULL,
    [totalSaldo] DECIMAL(16,2) NOT NULL,
    CONSTRAINT [simpanan_noAnggota_key] UNIQUE NONCLUSTERED ([noAnggota])
);

-- CreateTable
CREATE TABLE [dbo].[barang] (
    [kodeBarang] VARCHAR(5) NOT NULL,
    [barcode] VARCHAR(15),
    [namaJenis] VARCHAR(50) NOT NULL,
    [namaBarang] VARCHAR(100) NOT NULL,
    [satuan] VARCHAR(10) NOT NULL,
    [stok] DECIMAL(16,2) NOT NULL,
    [hargaJual] DECIMAL(16,2) NOT NULL,
    [fileName] VARCHAR(50) NOT NULL CONSTRAINT [barang_fileName_df] DEFAULT 'no-image.png',
    CONSTRAINT [barang_pkey] PRIMARY KEY CLUSTERED ([kodeBarang]),
    CONSTRAINT [barang_kodeBarang_key] UNIQUE NONCLUSTERED ([kodeBarang])
);

-- CreateTable
CREATE TABLE [dbo].[orders] (
    [id] INT NOT NULL IDENTITY(1,1),
    [invoiceNo] VARCHAR(20),
    [transactionType] VARCHAR(30) NOT NULL CONSTRAINT [orders_transactionType_df] DEFAULT 'Belanja',
    [noAnggota] VARCHAR(50) NOT NULL,
    [transactionDate] DATE NOT NULL,
    [orderStatus] VARCHAR(20) NOT NULL,
    [shippingMethod] VARCHAR(20),
    [paymentMethod] VARCHAR(20),
    [amount] DECIMAL(16,2) NOT NULL CONSTRAINT [orders_amount_df] DEFAULT 0,
    [remark] VARCHAR(100) NOT NULL,
    [notes] VARCHAR(200) NOT NULL,
    CONSTRAINT [orders_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[order_details] (
    [parentId] INT NOT NULL,
    [index] INT NOT NULL,
    [kodeBarang] VARCHAR(5) NOT NULL,
    [price] DECIMAL(16,2) NOT NULL CONSTRAINT [order_details_price_df] DEFAULT 0,
    [qty] INT NOT NULL CONSTRAINT [order_details_qty_df] DEFAULT 1,
    CONSTRAINT [order_details_parentId_index_key] UNIQUE NONCLUSTERED ([parentId],[index])
);

-- CreateTable
CREATE TABLE [dbo].[promotions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [source] VARCHAR(100) NOT NULL,
    [active] BIT NOT NULL CONSTRAINT [promotions_active_df] DEFAULT 1,
    CONSTRAINT [promotions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[users] ADD CONSTRAINT [users_memberId_fkey] FOREIGN KEY ([memberId]) REFERENCES [dbo].[anggota]([noAnggota]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[sessions] ADD CONSTRAINT [sessions_username_fkey] FOREIGN KEY ([username]) REFERENCES [dbo].[users]([username]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[pinjaman] ADD CONSTRAINT [pinjaman_noAnggota_fkey] FOREIGN KEY ([noAnggota]) REFERENCES [dbo].[anggota]([noAnggota]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[rincian_pinjaman] ADD CONSTRAINT [rincian_pinjaman_refCode_fkey] FOREIGN KEY ([refCode]) REFERENCES [dbo].[pinjaman]([refCode]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[simpanan] ADD CONSTRAINT [simpanan_noAnggota_fkey] FOREIGN KEY ([noAnggota]) REFERENCES [dbo].[anggota]([noAnggota]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[orders] ADD CONSTRAINT [orders_noAnggota_fkey] FOREIGN KEY ([noAnggota]) REFERENCES [dbo].[anggota]([noAnggota]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[order_details] ADD CONSTRAINT [order_details_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[orders]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[order_details] ADD CONSTRAINT [order_details_kodeBarang_fkey] FOREIGN KEY ([kodeBarang]) REFERENCES [dbo].[barang]([kodeBarang]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
