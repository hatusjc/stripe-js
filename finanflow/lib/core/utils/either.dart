sealed class Either<L, R> {
  const Either();

  bool get isLeft => this is Left<L, R>;
  bool get isRight => this is Right<L, R>;

  L get left => (this as Left<L, R>).value;
  R get right => (this as Right<L, R>).value;

  T fold<T>(T Function(L) onLeft, T Function(R) onRight) {
    return switch (this) {
      Left<L, R>(value: final v) => onLeft(v),
      Right<L, R>(value: final v) => onRight(v),
    };
  }

  Either<L, T> map<T>(T Function(R) f) {
    return switch (this) {
      Left<L, R>(value: final v) => Left(v),
      Right<L, R>(value: final v) => Right(f(v)),
    };
  }
}

final class Left<L, R> extends Either<L, R> {
  const Left(this.value);
  final L value;
}

final class Right<L, R> extends Either<L, R> {
  const Right(this.value);
  final R value;
}
