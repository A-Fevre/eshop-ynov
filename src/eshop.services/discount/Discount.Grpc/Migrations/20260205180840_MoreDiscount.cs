using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Discount.Grpc.Migrations
{
    /// <inheritdoc />
    public partial class MoreDiscount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Coupon",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AllowOnSaleItems", "MaxCumulativePercentage" },
                values: new object[] { true, 30.0 });

            migrationBuilder.UpdateData(
                table: "Coupon",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "AllowOnSaleItems", "MaxCumulativePercentage", "ProductName" },
                values: new object[] { true, 30.0, "Samsung 10" });

            migrationBuilder.InsertData(
                table: "Coupon",
                columns: new[] { "Id", "AllowOnSaleItems", "Code", "Description", "EndDate", "IsCumulative", "IsDeleted", "MaxCumulativePercentage", "MinimumOrderAmount", "ProductName", "StartDate", "Status", "Type", "Value" },
                values: new object[,]
                {
                    { 3, true, "WELCOME30", "Applied only on basket", new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), false, false, 30.0, 300.0, "", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 0, 100.0 },
                    { 4, true, "HUAWEI_P", "Applied only on huawei plus phone", new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), false, false, 30.0, 30.0, "Huawei Plus", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 0, 50.0 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Coupon",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Coupon",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DropColumn(
                name: "AllowOnSaleItems",
                table: "Coupon");

            migrationBuilder.DropColumn(
                name: "MaxCumulativePercentage",
                table: "Coupon");

            migrationBuilder.UpdateData(
                table: "Coupon",
                keyColumn: "Id",
                keyValue: 2,
                column: "ProductName",
                value: "IPhone X");
        }
    }
}
