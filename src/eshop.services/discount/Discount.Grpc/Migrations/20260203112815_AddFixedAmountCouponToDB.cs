using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Discount.Grpc.Migrations
{
    /// <inheritdoc />
    public partial class AddFixedAmountCouponToDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Coupon",
                columns: new[] { "Id", "AllowOnSaleItems", "Code", "Description", "EndDate", "IsCumulative", "IsDeleted", "MaxCumulativePercentage", "MinimumOrderAmount", "StartDate", "Status", "Type", "Value" },
                values: new object[] { 2, true, "WELCOME20", "Bienvenue", new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), false, false, 30.0, 50.0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 0, 10.0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Coupon",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
